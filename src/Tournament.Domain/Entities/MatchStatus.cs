namespace Tournament.Domain.Entities;

/// <summary>
/// Represents the lifecycle state of a match within the simulation.
/// </summary>
public enum MatchStatus
{
    Scheduled = 0,
    Played = 1
}
