using Tournament.Application.Abstractions;
using Tournament.Domain.Entities;

namespace Tournament.Application.Services;

/// <summary>
/// Computes deterministic standings leveraging configurable tie-breakers.
/// </summary>
public sealed class RankingService : IRankingService
{
    private const int PointsPerWin = 3;
    private const int PointsPerDraw = 1;
    /// <inheritdoc />
    public IReadOnlyCollection<StandingRow> CalculateStandings(Group group, IEnumerable<Match> matches)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        if (matches is null)
        {
            throw new ArgumentNullException(nameof(matches));
        }

        var matchList = matches.Where(m => m.Status == MatchStatus.Played).ToList();
        var teams = group.Teams.ToDictionary(team => team.Id);
        var aggregates = InitializeAggregates(teams.Values);

        foreach (var match in matchList)
        {
            UpdateAggregates(aggregates, match, teams);
        }

        var provisional = aggregates.Values
            .Select(aggregate => StandingRow.Create(
                group.Id,
                teams[aggregate.TeamId],
                aggregate.Played,
                aggregate.Wins,
                aggregate.Draws,
                aggregate.Losses,
                aggregate.GoalsFor,
                aggregate.GoalsAgainst))
            .ToList();

        var ordered = ApplyTieBreakers(provisional, matchList, teams);
        return ordered.ToList();
    }

    private static Dictionary<Guid, TeamAggregate> InitializeAggregates(IEnumerable<Team> teams)
    {
        var aggregates = new Dictionary<Guid, TeamAggregate>();
        foreach (var team in teams)
        {
            aggregates[team.Id] = new TeamAggregate(team.Id);
        }

        return aggregates;
    }

    private static void UpdateAggregates(Dictionary<Guid, TeamAggregate> aggregates, Match match, IReadOnlyDictionary<Guid, Team> teams)
    {
        if (!match.HomeScore.HasValue || !match.AwayScore.HasValue)
        {
            return;
        }

        var homeTeam = teams[match.HomeTeamId];
        var awayTeam = teams[match.AwayTeamId];

        aggregates[homeTeam.Id].RegisterMatch(match.HomeScore.Value, match.AwayScore.Value);
        aggregates[awayTeam.Id].RegisterMatch(match.AwayScore.Value, match.HomeScore.Value);

        if (match.HomeScore == match.AwayScore)
        {
            aggregates[homeTeam.Id].RegisterDraw();
            aggregates[awayTeam.Id].RegisterDraw();
            return;
        }

        var winner = match.HomeScore > match.AwayScore ? homeTeam.Id : awayTeam.Id;
        var loser = match.HomeScore > match.AwayScore ? awayTeam.Id : homeTeam.Id;
        aggregates[winner].RegisterWin();
        aggregates[loser].RegisterLoss();
    }

    private static IEnumerable<StandingRow> ApplyTieBreakers(
        IReadOnlyCollection<StandingRow> standings,
        IReadOnlyCollection<Match> matches,
        IReadOnlyDictionary<Guid, Team> teams)
    {
        var ordered = standings
            .OrderByDescending(row => row.Points)
            .ThenByDescending(row => row.GoalDifference)
            .ThenByDescending(row => row.GoalsFor)
            .ThenBy(row => row.GoalsAgainst)
            .ToList();

        var index = 0;
        while (index < ordered.Count)
        {
            var tiedGroup = ordered
                .Skip(index)
                .TakeWhile(row => ArePrimaryMetricsEqual(row, ordered[index]))
                .ToList();

            if (tiedGroup.Count > 1)
            {
                var resolved = ResolveHeadToHead(tiedGroup, matches, teams);
                for (var offset = 0; offset < resolved.Count; offset++)
                {
                    ordered[index + offset] = resolved[offset];
                }
            }

            index += tiedGroup.Count;
        }

        return ordered;
    }

    private static IList<StandingRow> ResolveHeadToHead(
        IReadOnlyCollection<StandingRow> tiedGroup,
        IReadOnlyCollection<Match> matches,
        IReadOnlyDictionary<Guid, Team> teams)
    {
        var tieIds = tiedGroup.Select(row => row.TeamId).ToHashSet();
        var relevantMatches = matches
            .Where(match => tieIds.Contains(match.HomeTeamId) && tieIds.Contains(match.AwayTeamId))
            .Where(match => match.Status == MatchStatus.Played)
            .ToList();

        var aggregates = InitializeAggregates(tieIds.Select(id => teams[id]));
        foreach (var match in relevantMatches)
        {
            UpdateAggregates(aggregates, match, teams);
        }

        var resolved = tiedGroup
            .OrderByDescending(row => aggregates[row.TeamId].Points)
            .ThenByDescending(row => aggregates[row.TeamId].GoalDifference)
            .ThenByDescending(row => aggregates[row.TeamId].GoalsFor)
            .ThenBy(row => aggregates[row.TeamId].GoalsAgainst)
            .ThenBy(row => teams[row.TeamId].Name, StringComparer.Ordinal)
            .ToList();

        return resolved;
    }

    private static bool ArePrimaryMetricsEqual(StandingRow left, StandingRow right)
    {
        return left.Points == right.Points
            && left.GoalDifference == right.GoalDifference
            && left.GoalsFor == right.GoalsFor
            && left.GoalsAgainst == right.GoalsAgainst;
    }

    private sealed class TeamAggregate
    {
        private int wins;
        private int draws;
        private int losses;
        private int goalsFor;
        private int goalsAgainst;

        internal TeamAggregate(Guid teamId)
        {
            TeamId = teamId;
        }

        internal Guid TeamId { get; }

        internal int Played => wins + draws + losses;

        internal int Wins => wins;

        internal int Draws => draws;

        internal int Losses => losses;

        internal int GoalsFor => goalsFor;

        internal int GoalsAgainst => goalsAgainst;

        internal int GoalDifference => goalsFor - goalsAgainst;

        internal int Points => wins * PointsPerWin + draws * PointsPerDraw;

        internal void RegisterMatch(int scored, int conceded)
        {
            goalsFor += scored;
            goalsAgainst += conceded;
        }

        internal void RegisterWin()
        {
            wins += 1;
        }

        internal void RegisterDraw()
        {
            draws += 1;
        }

        internal void RegisterLoss()
        {
            losses += 1;
        }
    }
}
