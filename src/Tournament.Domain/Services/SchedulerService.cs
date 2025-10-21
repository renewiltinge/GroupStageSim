using Tournament.Domain.Entities;

namespace Tournament.Domain.Services;

/// <summary>
/// Generates round-robin schedules for a four-team group.
/// </summary>
public sealed class SchedulerService
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
        var kickoff = firstKickoff;

        foreach (var (round, pairings) in BuildFixedRounds(teams))
        {
            foreach (var (home, away) in pairings)
            {
                fixtures.Add(new Match(Guid.NewGuid(), group.Id, home.Id, away.Id, round, kickoff));
                kickoff = kickoff.AddDays(1);
            }
        }

        return fixtures;
    }

    /// <summary>
    /// Creates the fixed pairing plan defined in the requirements.
    /// </summary>
    /// <param name="teams">Team roster.</param>
    /// <returns>Collection of rounds with pairings.</returns>
    private static IReadOnlyCollection<(int Round, IReadOnlyCollection<(Team Home, Team Away)> Pairings)> BuildFixedRounds(IReadOnlyList<Team> teams)
    {
        if (teams.Count != 4)
        {
            throw new ArgumentException("Scheduler expects exactly four teams.", nameof(teams));
        }

        var round1 = new List<(Team, Team)>
        {
            (teams[0], teams[1]),
            (teams[2], teams[3])
        };

        var round2 = new List<(Team, Team)>
        {
            (teams[0], teams[2]),
            (teams[1], teams[3])
        };

        var round3 = new List<(Team, Team)>
        {
            (teams[0], teams[3]),
            (teams[1], teams[2])
        };

        return new List<(int, IReadOnlyCollection<(Team, Team)>)>
        {
            (1, round1),
            (2, round2),
            (3, round3)
        };
    }
}
