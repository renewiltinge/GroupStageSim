using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Simulator.Worker.Options;
using Simulator.Worker.Simulation;
using Tournament.Domain.Entities;

namespace Simulator.Worker.Tests;

public class PoissonSimulationEngineTests
{
    [Fact]
    public async Task SimulateAsync_WithSameMatchAndIteration_ProducesDeterministicResults()
    {
        // Arrange
        var options = Microsoft.Extensions.Options.Options.Create(new SimulationOptions
        {
            DefaultSeed = 42,
            BaseRate = 1.3,
            HomeAdvantage = 1.05,
            AwayModifier = 0.95,
            MaxGoals = 10
        });

        var logger = NullLogger<PoissonSimulationEngine>.Instance;
        var engine = new PoissonSimulationEngine(options, logger);

        var groupId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var homeTeamId = Guid.NewGuid();
        var awayTeamId = Guid.NewGuid();

        var match = new Match(matchId, groupId, homeTeamId, awayTeamId, 1, DateTimeOffset.UtcNow);
        var homeTeam = new Team(homeTeamId, "Home", 1.1);
        var awayTeam = new Team(awayTeamId, "Away", 0.95);

        // Act
        var firstResult = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 1, CancellationToken.None);
        var secondResult = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 1, CancellationToken.None);

        var thirdResult = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 2, CancellationToken.None);
        var fourthResult = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 2, CancellationToken.None);

        // Assert
        firstResult.Should().Be(secondResult);
        thirdResult.Should().Be(fourthResult);
    }

    [Fact]
    public async Task SimulateAsync_OverManyIterations_DemonstratesHomeAdvantage()
    {
        // Arrange
        var options = Microsoft.Extensions.Options.Options.Create(new SimulationOptions
        {
            DefaultSeed = 123,
            BaseRate = 1.2,
            HomeAdvantage = 1.10,
            AwayModifier = 0.95,
            MaxGoals = 8
        });

        var engine = new PoissonSimulationEngine(options, NullLogger<PoissonSimulationEngine>.Instance);

        var groupId = Guid.NewGuid();
        var matchId = Guid.NewGuid();
        var homeTeamId = Guid.NewGuid();
        var awayTeamId = Guid.NewGuid();
        var match = new Match(matchId, groupId, homeTeamId, awayTeamId, 1, DateTimeOffset.UtcNow);
        var homeTeam = new Team(homeTeamId, "Home", 1.10);
        var awayTeam = new Team(awayTeamId, "Away", 0.95);

        const int samples = 2000; // Balance between speed and statistical significance
        var homeWins = 0;
        var draws = 0;

        // Act
        for (var i = 1; i <= samples; i++)
        {
            var result = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: i, CancellationToken.None);
            if (result.HomeScore > result.AwayScore) 
                homeWins++;
            else if (result.HomeScore == result.AwayScore) 
                draws++;
        }

        var homeWinRate = (double)homeWins / samples;
        var drawRate = (double)draws / samples;

        // Assert
        homeWinRate.Should().BeGreaterThan(0.40, "Home advantage should result in higher win probability");
        homeWinRate.Should().BeGreaterThan(drawRate, "Home wins should exceed draws due to advantage");
    }
}