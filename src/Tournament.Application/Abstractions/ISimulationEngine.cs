using Tournament.Domain.Entities;

namespace Tournament.Application.Abstractions;

/// <summary>
/// Produces simulated scores for scheduled matches.
/// </summary>
public interface ISimulationEngine
{
    /// <summary>
    /// Simulates a match outcome using probabilistic models.
    /// </summary>
    /// <param name="match">Match metadata.</param>
    /// <param name="homeTeam">Home team profile.</param>
    /// <param name="awayTeam">Away team profile.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Simulated scoreline.</returns>
    Task<(int HomeScore, int AwayScore)> SimulateAsync(
        Match match,
        Team homeTeam,
        Team awayTeam,
        CancellationToken cancellationToken);
}
