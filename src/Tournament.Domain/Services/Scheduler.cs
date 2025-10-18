using Tournament.Domain.Entities;

namespace Tournament.Domain.Services;

/// <summary>
/// Generates round-robin schedules for a four-team group.
/// </summary>
public sealed class Scheduler
{
    /// <summary>
    /// Builds a three-round schedule that produces six unique fixtures.
    /// </summary>
    /// <param name="group">The target group.</param>
    /// <param name="firstKickoff">Timestamp for the initial fixture.</param>
    /// <returns>A collection of scheduled matches.</returns>
    public IReadOnlyCollection<Match> CreateSchedule(Group group, DateTimeOffset firstKickoff)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        var teams = group.Teams.ToList();
        var fixtures = new List<Match>(6);
        var rounds = BuildRoundRobinPairs(teams);
        var kickoff = firstKickoff;

        foreach (var (roundIndex, pairings) in rounds)
        {
            foreach (var (home, away) in pairings)
            {
                var match = new Match(Guid.NewGuid(), group.Id, home.Id, away.Id, roundIndex + 1, kickoff);
                fixtures.Add(match);
                kickoff = kickoff.AddDays(1);
            }
        }

        return fixtures;
    }

    /// <summary>
    /// Creates round-robin pairings using the circle method for four teams.
    /// </summary>
    /// <param name="teams">Team roster.</param>
    /// <returns>Tuple of round index and pairings.</returns>
    private static IReadOnlyCollection<(int RoundIndex, IReadOnlyCollection<(Team Home, Team Away)> Pairings)> BuildRoundRobinPairs(IReadOnlyList<Team> teams)
    {
        if (teams.Count != 4)
        {
            throw new ArgumentException("Scheduler expects exactly four teams.", nameof(teams));
        }

        var pairings = new List<(int, IReadOnlyCollection<(Team, Team)>)>(3);
        var rotation = teams.Skip(1).ToList();

        for (var round = 0; round < 3; round++)
        {
            var current = new List<(Team, Team)>
            {
                (teams[0], rotation[round % rotation.Count])
            };

            var remaining = rotation.Where((_, index) => index != round % rotation.Count).ToList();
            if (remaining.Count != 2)
            {
                throw new InvalidOperationException("Unable to derive remaining pairings.");
            }

            current.Add((remaining[0], remaining[1]));
            pairings.Add((round, current));
        }

        return pairings;
    }
}
