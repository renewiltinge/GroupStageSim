using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Simulator.Worker.Options;
using Tournament.Application.Abstractions;
using Tournament.Domain.Entities;

namespace Simulator.Worker.Simulation;

/// <summary>
/// Implements a Poisson-based simulation engine for match scoring.
/// </summary>
public sealed class PoissonSimulationEngine : ISimulationEngine
{
    private readonly SimulationOptions options;
    private readonly ILogger<PoissonSimulationEngine> logger;
    private readonly ThreadLocal<Random> random;

    /// <summary>
    /// Initializes a new instance of the <see cref="PoissonSimulationEngine"/> class.
    /// </summary>
    /// <param name="options">Simulation configuration.</param>
    /// <param name="logger">Logger instance.</param>
    public PoissonSimulationEngine(IOptions<SimulationOptions> options, ILogger<PoissonSimulationEngine> logger)
    {
        this.options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
        random = new ThreadLocal<Random>(() => new Random(this.options.DefaultSeed));
    }

    /// <inheritdoc />
    public Task<(int HomeScore, int AwayScore)> SimulateAsync(
        Match match,
        Team homeTeam,
        Team awayTeam,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var ratio = ClampStrength(homeTeam.Strength / awayTeam.Strength);
        var ratioOpp = ClampStrength(awayTeam.Strength / homeTeam.Strength);

        var lambdaHome = options.BaseRate * ratio * options.HomeAdvantage;
        var lambdaAway = options.BaseRate * ratioOpp * options.AwayModifier;

        var homeGoals = SamplePoisson(lambdaHome);
        var awayGoals = SamplePoisson(lambdaAway);

        logger.LogDebug("Simulated match {MatchId} with λ_home={HomeLambda}, λ_away={AwayLambda}, result={Home}-{Away}", match.Id, lambdaHome, lambdaAway, homeGoals, awayGoals);
        return Task.FromResult((homeGoals, awayGoals));
    }

    /// <summary>
    /// Samples a Poisson-distributed random number using Knuth's algorithm.
    /// </summary>
    /// <param name="lambda">Distribution parameter.</param>
    /// <returns>Sampled integer.</returns>
    private int SamplePoisson(double lambda)
    {
        var limit = Math.Exp(-lambda);
        var value = 0;
        var product = 1d;
        var rng = random.Value!;

        do
        {
            value++;
            product *= rng.NextDouble();
        }
        while (product > limit);

        var goals = Math.Min(value - 1, options.MaxGoals);
        return goals;
    }

    /// <summary>
    /// Clamps strength ratio to avoid runaway values.
    /// </summary>
    /// <param name="ratio">Strength ratio.</param>
    /// <returns>Clamped ratio.</returns>
    private static double ClampStrength(double ratio)
    {
        return Math.Clamp(ratio, 0.5d, 1.5d);
    }
}
