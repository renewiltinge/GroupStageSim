using Tournament.Domain.Entities;

namespace Tournament.Domain.Services;

/// <summary>
/// Applies simulated results to matches while enforcing score validation.
/// </summary>
public sealed class MatchResultApplier
{
    /// <summary>
    /// Applies the provided scoreline to the specified match within a group.
    /// </summary>
    /// <param name="group">Target group containing the match.</param>
    /// <param name="matchId">Identifier of the match to update.</param>
    /// <param name="homeScore">Home goals scored.</param>
    /// <param name="awayScore">Away goals scored.</param>
    public void Apply(Group group, Guid matchId, int homeScore, int awayScore)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        var match = group.GetMatch(matchId);
        match.ApplyResult(homeScore, awayScore);
    }
}
