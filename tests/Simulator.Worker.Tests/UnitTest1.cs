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
}
