using Tournament.Domain.Entities;

namespace Tournament.Application.Abstractions;

/// <summary>
/// Provides ranking calculations for tournament groups.
/// </summary>
public interface IRankingService
{
    /// <summary>
    /// Calculates ordered standings for the supplied group and matches.
    /// </summary>
    /// <param name="group">Group context.</param>
    /// <param name="matches">Matches to evaluate.</param>
    /// <returns>Ordered standings rows.</returns>
    IReadOnlyCollection<StandingRow> CalculateStandings(Group group, IEnumerable<Match> matches);
}
