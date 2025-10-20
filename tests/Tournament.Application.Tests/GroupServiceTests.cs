using FluentAssertions;
using GroupStageSim.Contracts;
using NSubstitute;
using Tournament.Application.Abstractions;
using Tournament.Application.Models;
using Tournament.Application.Services;
using Tournament.Domain.Entities;
using Tournament.Domain.Services;

namespace Tournament.Application.Tests;

public class GroupServiceTests
{
    [Fact]
    public async Task ApplyMatchResultAsync_WithValidMatch_PersistsResultAndUpdatesJob()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var correlationId = Guid.NewGuid();

        var teams = Enumerable.Range(0, 4)
            .Select(index => new Team(Guid.NewGuid(), $"Team {index}", 1.0 + index * 0.1))
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

        // Act
        await service.ApplyMatchResultAsync(groupId, matchId, 2, 1, correlationId, CancellationToken.None);

        // Assert
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
    public async Task TriggerSimulationAsync_WithMultipleIterations_CreatesJobAndSimulatesInProcess()
    {
        // Arrange
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

        // Act
        var correlationId = await service.TriggerSimulationAsync(groupId, iterations, CancellationToken.None);

        // Assert
        correlationId.Should().NotBe(Guid.Empty);
        
        // Verify simulation job was created
        await simulationJobRepository.Received(1).AddAsync(
            Arg.Is<SimulationJob>(job => job.GroupId == groupId && job.Iterations == iterations), 
            Arg.Any<CancellationToken>());
        
        await simulationJobRepository.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        
        // Verify match result was applied (in-process simulation)
        await simulationJobRepository.Received().GetByCorrelationIdAsync(correlationId, Arg.Any<CancellationToken>());
    }
}
