using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Simulator.Worker.Simulation;
using Tournament.Application.Abstractions;
using Tournament.Application.Exceptions;
using Tournament.Application.Services;
using Tournament.Domain.Entities;
using Tournament.Infrastructure.Messaging.Options;
using GroupMatchScheduled = GroupStageSim.Contracts.MatchScheduled;
using GroupMatchPlayed = GroupStageSim.Contracts.MatchPlayed;

namespace Simulator.Worker.Messaging;

/// <summary>
/// Background service that consumes scheduled matches and emits simulated results.
/// </summary>
public sealed class MatchSimulationWorker : BackgroundService
{
    private const string QueueName = "groupsim.match-scheduled";
    private const int MaxRetryAttempts = 3;

    private readonly IServiceScopeFactory scopeFactory;
    private readonly RabbitMqOptions rabbitOptions;
    private readonly ILogger<MatchSimulationWorker> logger;
    private readonly JsonSerializerOptions serializerOptions = new(JsonSerializerDefaults.Web);

    private IConnection? connection;
    private IModel? channel;
    private CancellationToken shutdownToken;
    private TaskCompletionSource completionSource = new(TaskCreationOptions.RunContinuationsAsynchronously);

    /// <summary>
    /// Initializes a new instance of the <see cref="MatchSimulationWorker"/> class.
    /// </summary>
    /// <param name="scopeFactory">Factory used to create scoped dependencies.</param>
    /// <param name="options">RabbitMQ options.</param>
    /// <param name="logger">Logger instance.</param>
    public MatchSimulationWorker(IServiceScopeFactory scopeFactory, IOptions<RabbitMqOptions> options, ILogger<MatchSimulationWorker> logger)
    {
        this.scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
        rabbitOptions = options?.Value ?? throw new ArgumentNullException(nameof(options));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <inheritdoc />
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        completionSource = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        shutdownToken = stoppingToken;
        var factory = new ConnectionFactory
        {
            HostName = rabbitOptions.Host,
            Port = rabbitOptions.Port,
            VirtualHost = rabbitOptions.VirtualHost,
            UserName = rabbitOptions.UserName,
            Password = rabbitOptions.Password,
            DispatchConsumersAsync = true
        };

        connection = factory.CreateConnection();
        channel = connection.CreateModel();
        channel.ExchangeDeclare(rabbitOptions.ExchangeName, ExchangeType.Topic, durable: true, autoDelete: false);
        channel.QueueDeclare(queue: QueueName, durable: true, exclusive: false, autoDelete: false);
        channel.QueueBind(QueueName, rabbitOptions.ExchangeName, routingKey: "match.scheduled");
        channel.BasicQos(0, 1, false);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.Received += OnMessageAsync;
        channel.BasicConsume(queue: QueueName, autoAck: false, consumer: consumer);

        logger.LogInformation("Match simulation worker subscribed to queue {Queue}", QueueName);

        stoppingToken.Register(() => completionSource.TrySetResult());
        return completionSource.Task;
    }

    private async Task OnMessageAsync(object sender, BasicDeliverEventArgs eventArgs)
    {
        var attempts = 0;
        while (!shutdownToken.IsCancellationRequested)
        {
            try
            {
                var scheduled = Deserialize(eventArgs.Body.Span);
                if (scheduled is null)
                {
                    channel!.BasicAck(eventArgs.DeliveryTag, multiple: false);
                    logger.LogWarning("Ignored malformed message with delivery tag {Tag}", eventArgs.DeliveryTag);
                    return;
                }

                await ProcessMessageAsync(scheduled, eventArgs.DeliveryTag).ConfigureAwait(false);
                break;
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                attempts++;
                var shouldRequeue = attempts < MaxRetryAttempts && !eventArgs.Redelivered;
                logger.LogError(ex, "Failed to process delivery tag {Tag} on attempt {Attempt}. Requeue={Requeue}", eventArgs.DeliveryTag, attempts, shouldRequeue);

                if (!shouldRequeue)
                {
                    channel!.BasicNack(eventArgs.DeliveryTag, multiple: false, requeue: false);
                    return;
                }

                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempts)), shutdownToken).ConfigureAwait(false);
            }
        }
    }

    private async Task ProcessMessageAsync(GroupMatchScheduled scheduled, ulong deliveryTag)
    {
        using var scope = scopeFactory.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<IGroupRepository>();
        var simulationEngine = scope.ServiceProvider.GetRequiredService<ISimulationEngine>();
        var messageBus = scope.ServiceProvider.GetRequiredService<IMessageBus>();
        var groupService = scope.ServiceProvider.GetRequiredService<GroupService>();

        var group = await repository.GetAsync(scheduled.GroupId, includeMatches: true, shutdownToken).ConfigureAwait(false);
        if (group is null)
        {
            logger.LogWarning("Received match for missing group {GroupId}; dropping message", scheduled.GroupId);
            channel!.BasicAck(deliveryTag, multiple: false);
            return;
        }

        var match = group.Matches.SingleOrDefault(match => match.Id == scheduled.MatchId);
        if (match is null)
        {
            logger.LogWarning("Match {MatchId} not found inside group {GroupId}; acknowledging message", scheduled.MatchId, scheduled.GroupId);
            channel!.BasicAck(deliveryTag, multiple: false);
            return;
        }

        var homeTeam = group.Teams.SingleOrDefault(team => team.Id == scheduled.HomeTeamId);
        var awayTeam = group.Teams.SingleOrDefault(team => team.Id == scheduled.AwayTeamId);

        if (homeTeam is null || awayTeam is null)
        {
            logger.LogWarning("Could not resolve teams {HomeTeamId} or {AwayTeamId} for match {MatchId}", scheduled.HomeTeamId, scheduled.AwayTeamId, scheduled.MatchId);
            channel!.BasicAck(deliveryTag, multiple: false);
            return;
        }

        var iterations = Math.Max(1, scheduled.Iterations);
        for (var iteration = 1; iteration <= iterations; iteration++)
        {
            shutdownToken.ThrowIfCancellationRequested();
            var (homeScore, awayScore) = await simulationEngine.SimulateAsync(match, homeTeam, awayTeam, iteration, shutdownToken).ConfigureAwait(false);

            var playedEvent = new GroupMatchPlayed(
                scheduled.MatchId,
                scheduled.GroupId,
                homeScore,
                awayScore,
                match.Round,
                iteration,
                DateTimeOffset.UtcNow,
                scheduled.CorrelationId);

            await messageBus.PublishAsync(playedEvent, shutdownToken).ConfigureAwait(false);
            logger.LogInformation(
                "Published MatchPlayed iteration {Iteration} for match {MatchId} (correlation {CorrelationId})",
                iteration,
                scheduled.MatchId,
                scheduled.CorrelationId);

            if (iteration == iterations)
            {
                try
                {
                    await groupService.ApplyMatchResultAsync(scheduled.GroupId, scheduled.MatchId, homeScore, awayScore, scheduled.CorrelationId, shutdownToken).ConfigureAwait(false);
                }
                catch (GroupNotFoundException)
                {
                    logger.LogWarning("Group {GroupId} disappeared before persisting results", scheduled.GroupId);
                }
            }
        }

        channel!.BasicAck(deliveryTag, multiple: false);
    }

    private GroupMatchScheduled? Deserialize(ReadOnlySpan<byte> payload)
    {
        try
        {
            return JsonSerializer.Deserialize<GroupMatchScheduled>(payload, serializerOptions);
        }
        catch (JsonException ex)
        {
            logger.LogWarning(ex, "Failed to deserialize MatchScheduled payload");
            return null;
        }
    }

    /// <inheritdoc />
    public override Task StopAsync(CancellationToken cancellationToken)
    {
        completionSource.TrySetResult();
        channel?.Close();
        connection?.Close();
        return base.StopAsync(cancellationToken);
    }

    /// <inheritdoc />
    public override void Dispose()
    {
        channel?.Dispose();
        connection?.Dispose();
        base.Dispose();
    }
}
