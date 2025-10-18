namespace Simulator.Worker.Options;

/// <summary>
/// Configurable parameters for the Poisson-based simulation engine.
/// </summary>
public sealed class SimulationOptions
{
    public double BaseRate { get; set; } = 1.3;

    public double HomeAdvantage { get; set; } = 1.05;

    public double AwayModifier { get; set; } = 0.95;

    public int DefaultSeed { get; set; } = 42;

    public int MaxGoals { get; set; } = 10;
}
