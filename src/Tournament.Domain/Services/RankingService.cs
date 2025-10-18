using Tournament.Domain.Entities;

namespace Tournament.Domain.Services;

/// <summary>
/// Computes deterministic standings leveraging configurable tie-breakers.
/// </summary>
public sealed class RankingService
{
    /// <summary>
    /// Calculates ordered standings for the supplied group.
    /// </summary>
    /// <param name="group">Group containing teams and matches.</param>
    /// <param name="matches">Played matches to evaluate.</param>
    /// <returns>Sorted standings rows.</returns>
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

    /// <summary>
    /// Creates initial aggregate records for each team.
    /// </summary>
    /// <param name="teams">Team roster.</param>
    /// <returns>Mutable aggregates keyed by team id.</returns>
    private static Dictionary<Guid, TeamAggregate> InitializeAggregates(IEnumerable<Team> teams)
    {
        var aggregates = new Dictionary<Guid, TeamAggregate>();
        foreach (var team in teams)
        {
            aggregates[team.Id] = new TeamAggregate(team.Id);
        }

        return aggregates;
    }

    /// <summary>
    /// Updates aggregate stats with a completed match outcome.
    /// </summary>
    /// <param name="aggregates">Aggregate dictionary.</param>
    /// <param name="match">Completed match.</param>
    /// <param name="teams">Team lookup.</param>
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

    /// <summary>
    /// Applies tie-breaker ordering including head-to-head evaluation.
    /// </summary>
    /// <param name="standings">Initial standings.</param>
    /// <param name="matches">Completed matches.</param>
    /// <param name="teams">Team lookup.</param>
    /// <returns>Ordered standings honoring tie-break rules.</returns>
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

    /// <summary>
    /// Resolves head-to-head ordering for tied teams.
    /// </summary>
    /// <param name="tiedGroup">Tied standings subset.</param>
    /// <param name="matches">Completed matches.</param>
    /// <param name="teams">Team lookup.</param>
    /// <returns>Ordered subset honoring head-to-head metrics.</returns>
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

    /// <summary>
    /// Determines whether two rows share identical primary metrics.
    /// </summary>
    /// <param name="left">Left row.</param>
    /// <param name="right">Right row.</param>
    /// <returns>True if metrics match.</returns>
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

        internal int Points => wins * 3 + draws;

        /// <summary>
        /// Registers the scoreline for a single team in a match.
        /// </summary>
        /// <param name="scored">Goals scored.</param>
        /// <param name="conceded">Goals conceded.</param>
        internal void RegisterMatch(int scored, int conceded)
        {
            goalsFor += scored;
            goalsAgainst += conceded;
        }

        /// <summary>
        /// Registers a victory outcome for the aggregate.
        /// </summary>
        internal void RegisterWin()
        {
            wins += 1;
        }

        /// <summary>
        /// Registers a draw outcome for the aggregate.
        /// </summary>
        internal void RegisterDraw()
        {
            draws += 1;
        }

        /// <summary>
        /// Registers a defeat outcome for the aggregate.
        /// </summary>
        internal void RegisterLoss()
        {
            losses += 1;
        }
    }
}
