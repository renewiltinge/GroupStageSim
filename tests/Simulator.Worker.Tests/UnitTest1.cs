using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Simulator.Worker.Options;
using Simulator.Worker.Simulation;
using Tournament.Domain.Entities;

namespace Simulator.Worker.Tests;

public class PoissonSimulationEngineTests
{
    [Fact]
    public async Task SimulateAsync_IsDeterministicPerMatchAndIteration()
    {
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

        var first = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 1, CancellationToken.None);
        var second = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 1, CancellationToken.None);

        Assert.Equal(first, second);

        var third = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 2, CancellationToken.None);
        var fourth = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: 2, CancellationToken.None);

        Assert.Equal(third, fourth);
    }

    [Fact]
    public async Task SimulateAsync_HomeAdvantageReflectsInAggregateProbability()
    {
        var options = Options.Create(new SimulationOptions
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

        const int samples = 2000; // keep test quick yet statistically meaningful
        var homeWins = 0;
        var draws = 0;
        for (var i = 1; i <= samples; i++)
        {
            var result = await engine.SimulateAsync(match, homeTeam, awayTeam, iteration: i, CancellationToken.None);
            if (result.HomeScore > result.AwayScore) homeWins++;
            else if (result.HomeScore == result.AwayScore) draws++;
        }

        var homeWinRate = (double)homeWins / samples;
        var drawRate = (double)draws / samples;

        // Expect home win rate comfortably above draw rate and > 0.40 for chosen parameters
        Assert.True(homeWinRate > 0.40, $"Expected homeWinRate > 0.40 but was {homeWinRate:F2}");
        Assert.True(homeWinRate > drawRate, $"Expected home wins > draws, rates: home={homeWinRate:F2}, draw={drawRate:F2}");
    }
}
