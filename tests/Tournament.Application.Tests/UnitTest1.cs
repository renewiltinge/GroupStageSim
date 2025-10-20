using GroupStageSim.Contracts;
using NSubstitute;
using Tournament.Application.Abstractions;
using Tournament.Application.Models;
using Tournament.Application.Services;
using Tournament.Domain.Entities;
using Tournament.Domain.Services;

namespace Tournament.Application.Tests;

public class SimulationJobTests
{
    [Fact]
    public void Create_WithZeroMatches_CompletesImmediately()
    {
        var groupId = Guid.NewGuid();
        var correlationId = Guid.NewGuid();
        var queuedAt = DateTimeOffset.UtcNow;

        var job = SimulationJob.Create(groupId, correlationId, 10, 0, queuedAt);

        Assert.Equal(SimulationJobStatus.Completed, job.Status);
        Assert.Equal(0, job.MatchesTotal);
        Assert.Equal(0, job.MatchesCompleted);
        Assert.Equal(queuedAt, job.CompletedAt);
        Assert.Equal(queuedAt, job.StartedAt);
    }

    [Fact]
    public void MarkMatchCompleted_TransitionsFromQueuedToCompleted()
    {
        var job = SimulationJob.Create(Guid.NewGuid(), Guid.NewGuid(), 5, 2, DateTimeOffset.UtcNow);

        Assert.Equal(SimulationJobStatus.Queued, job.Status);
        Assert.Equal(0, job.MatchesCompleted);

        var firstTimestamp = DateTimeOffset.UtcNow.AddSeconds(1);
        job.MarkMatchCompleted(firstTimestamp);

        Assert.Equal(SimulationJobStatus.Running, job.Status);
        Assert.Equal(1, job.MatchesCompleted);
        Assert.Equal(firstTimestamp, job.StartedAt);
        Assert.Equal(firstTimestamp, job.LastUpdatedAt);
        Assert.Null(job.CompletedAt);

        var secondTimestamp = firstTimestamp.AddSeconds(1);
        job.MarkMatchCompleted(secondTimestamp);

        Assert.Equal(SimulationJobStatus.Completed, job.Status);
        Assert.Equal(2, job.MatchesCompleted);
        Assert.Equal(secondTimestamp, job.CompletedAt);
        Assert.Equal(secondTimestamp, job.LastUpdatedAt);
    }
}

public class GroupServiceTests
{
    [Fact]
    public async Task ApplyMatchResultAsync_PersistsMatchAndUpdatesSimulationJob()
    {
        var groupId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var correlationId = Guid.NewGuid();

        var teams = Enumerable.Range(0, 4)
            .Select(index => new Team(Guid.NewGuid(), $"Team {index}", 50 + index))
            .ToList();

        var group = new Group(groupId, "Test Group", teams);
        group.AddMatches(new[]
        {
            new Match(matchId, groupId, teams[0].Id, teams[1].Id, 1, DateTimeOffset.UtcNow)
        });

        var simulationJob = SimulationJob.Create(groupId, correlationId, 1, 1, DateTimeOffset.UtcNow);

        var groupRepository = Substitute.For<IGroupRepository>();
        groupRepository.GetAsync(groupId, true, Arg.Any<CancellationToken>()).Returns(group);

        var messageBus = Substitute.For<IMessageBus>();
        var scheduler = new Scheduler();
        IRankingService rankingService = new RankingService();
        var matchResultApplier = new MatchResultApplier();

        var simulationJobRepository = Substitute.For<ISimulationJobRepository>();
        simulationJobRepository.GetByCorrelationIdAsync(correlationId, Arg.Any<CancellationToken>()).Returns(simulationJob);

        var service = new GroupService(
            groupRepository,
            messageBus,
            scheduler,
            rankingService,
            matchResultApplier,
            simulationJobRepository);

        await service.ApplyMatchResultAsync(groupId, matchId, 2, 1, correlationId, CancellationToken.None);

        await groupRepository.Received(1).UpdateAsync(
            Arg.Is<Group>(updated => updated.Matches.Single().Status == MatchStatus.Played
                && updated.Matches.Single().HomeScore == 2
                && updated.Matches.Single().AwayScore == 1),
            Arg.Any<CancellationToken>());

        await groupRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());

        await simulationJobRepository.Received(1).UpdateAsync(
            Arg.Is<SimulationJob>(job => job.Status == SimulationJobStatus.Completed
                && job.MatchesCompleted == job.MatchesTotal),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task TriggerSimulationAsync_EnqueuesIterationAwareMessages()
    {
        var groupId = Guid.NewGuid();
        var homeTeam = new Team(Guid.NewGuid(), "Alpha", 1.1);
        var awayTeam = new Team(Guid.NewGuid(), "Bravo", 0.9);
        var teams = new List<Team> { homeTeam, awayTeam, new Team(Guid.NewGuid(), "Charlie", 1.0), new Team(Guid.NewGuid(), "Delta", 0.95) };
        var group = new Group(groupId, "Group A", teams);

        var match = new Match(Guid.NewGuid(), groupId, homeTeam.Id, awayTeam.Id, 1, DateTimeOffset.UtcNow.AddHours(1));
        group.AddMatches(new[] { match });

        var groupRepository = Substitute.For<IGroupRepository>();
        groupRepository.GetAsync(groupId, true, Arg.Any<CancellationToken>()).Returns(group);

        var messageBus = Substitute.For<IMessageBus>();
        var publishedMessages = new List<MatchScheduled>();
        messageBus
            .PublishAsync(Arg.Any<MatchScheduled>(), Arg.Any<CancellationToken>())
            .Returns(call =>
            {
                publishedMessages.Add(call.Arg<MatchScheduled>());
                return Task.CompletedTask;
            });

        var scheduler = new Scheduler();
        IRankingService rankingService = new RankingService();
        var matchResultApplier = new MatchResultApplier();
        var simulationJobRepository = Substitute.For<ISimulationJobRepository>();

        var service = new GroupService(
            groupRepository,
            messageBus,
            scheduler,
            rankingService,
            matchResultApplier,
            simulationJobRepository);

        const int iterations = 3;
        var correlationId = await service.TriggerSimulationAsync(groupId, iterations, CancellationToken.None);

        Assert.NotEqual(Guid.Empty, correlationId);
        Assert.Equal(iterations, publishedMessages.Count);

        for (var index = 0; index < iterations; index++)
        {
            var message = publishedMessages[index];
            Assert.Equal(match.Id, message.MatchId);
            Assert.Equal(groupId, message.GroupId);
            Assert.Equal(index + 1, message.Iteration);
            Assert.Equal(iterations, message.Iterations);
            Assert.Equal(match.ScheduledKickoff, message.ScheduledKickoff);
            Assert.Equal(homeTeam.Strength, message.StrengthHome);
            Assert.Equal(awayTeam.Strength, message.StrengthAway);
            Assert.Equal(correlationId, message.CorrelationId);
        }

        await messageBus.Received(iterations).PublishAsync(Arg.Any<MatchScheduled>(), Arg.Any<CancellationToken>());
        await simulationJobRepository.Received(1).AddAsync(Arg.Is<SimulationJob>(job => job.GroupId == groupId && job.Iterations == iterations), Arg.Any<CancellationToken>());
    }
}
