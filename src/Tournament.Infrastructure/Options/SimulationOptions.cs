namespace Tournament.Infrastructure.Options;

/// <summary>
/// Configuration options for simulation parameters.
/// </summary>
public sealed class SimulationOptions
{
    public double BaseRate { get; set; } = 1.3;
    public double HomeAdvantage { get; set; } = 1.05;
    public double AwayModifier { get; set; } = 0.95;
    public int MaxGoals { get; set; } = 10;
    public int DefaultSeed { get; set; } = 12345;
}