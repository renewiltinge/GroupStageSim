using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using Tournament.Application.Abstractions;
using Tournament.Infrastructure.Messaging.Options;
using MatchPlayedEvent = GroupStageSim.Contracts.MatchPlayed;
using MatchScheduledEvent = GroupStageSim.Contracts.MatchScheduled;

namespace Tournament.Infrastructure.Messaging;

/// <summary>
/// RabbitMQ implementation of <see cref="IMessageBus"/>.
/// </summary>
public sealed class RabbitMqMessageBus : IMessageBus, IDisposable
{
    private readonly ILogger<RabbitMqMessageBus> logger;
    private readonly RabbitMqOptions options;
    private readonly IConnection connection;

    /// <summary>
    /// Initializes a new instance of the <see cref="RabbitMqMessageBus"/> class.
    /// </summary>
    /// <param name="optionsAccessor">Options accessor for RabbitMQ settings.</param>
    /// <param name="logger">Logger instance.</param>
    public RabbitMqMessageBus(IOptions<RabbitMqOptions> optionsAccessor, ILogger<RabbitMqMessageBus> logger)
    {
        options = optionsAccessor?.Value ?? throw new ArgumentNullException(nameof(optionsAccessor));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));

        var factory = new ConnectionFactory
        {
            HostName = options.Host,
            Port = options.Port,
            VirtualHost = options.VirtualHost,
            UserName = options.UserName,
            Password = options.Password,
            DispatchConsumersAsync = true
        };

        connection = factory.CreateConnection();
    }

    /// <inheritdoc />
    public Task PublishAsync<TMessage>(TMessage message, CancellationToken cancellationToken)
        where TMessage : class
    {
        if (message is null)
        {
            throw new ArgumentNullException(nameof(message));
        }

        cancellationToken.ThrowIfCancellationRequested();

        using var channel = connection.CreateModel();
        channel.ExchangeDeclare(options.ExchangeName, ExchangeType.Topic, durable: true, autoDelete: false);

        var payload = JsonSerializer.SerializeToUtf8Bytes(message);
        var properties = channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.ContentType = "application/json";

        var routingKey = ResolveRoutingKey(message);
        channel.BasicPublish(options.ExchangeName, routingKey, properties, payload);
        logger.LogInformation("Published {MessageType} with routing key {RoutingKey}", typeof(TMessage).Name, routingKey);

        return Task.CompletedTask;
    }

    /// <summary>
    /// Resolves routing keys based on the message type.
    /// </summary>
    /// <param name="message">Payload instance.</param>
    /// <returns>Routing key.</returns>
    private static string ResolveRoutingKey<TMessage>(TMessage message)
        where TMessage : class
    {
        return message switch
        {
            MatchScheduledEvent => "match.scheduled",
            MatchPlayedEvent => "match.played",
            _ => typeof(TMessage).Name.ToLowerInvariant()
        };
    }

    /// <inheritdoc />
    public void Dispose()
    {
        connection.Dispose();
    }
}
