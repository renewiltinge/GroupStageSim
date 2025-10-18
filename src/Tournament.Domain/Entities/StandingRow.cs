namespace Tournament.Domain.Entities;

/// <summary>
/// Represents the aggregated standings metrics for a single team inside a group.
/// </summary>
public sealed class StandingRow
{
    private StandingRow(
        Guid groupId,
        Guid teamId,
        string teamName,
        int played,
        int wins,
        int draws,
        int losses,
        int goalsFor,
        int goalsAgainst,
        int points)
    {
        GroupId = groupId;
        TeamId = teamId;
        TeamName = teamName;
        Played = played;
        Wins = wins;
        Draws = draws;
        Losses = losses;
        GoalsFor = goalsFor;
        GoalsAgainst = goalsAgainst;
        GoalDifference = goalsFor - goalsAgainst;
        Points = points;
    }

    public Guid GroupId { get; }

    public Guid TeamId { get; }

    public string TeamName { get; }

    public int Played { get; }

    public int Wins { get; }

    public int Draws { get; }

    public int Losses { get; }

    public int GoalsFor { get; }

    public int GoalsAgainst { get; }

    public int GoalDifference { get; }

    public int Points { get; }

    /// <summary>
    /// Creates a new standings row based on match outcomes.
    /// </summary>
    /// <param name="groupId">Identifier of the related group.</param>
    /// <param name="team">Team metadata.</param>
    /// <param name="played">Total matches played.</param>
    /// <param name="wins">Total wins.</param>
    /// <param name="draws">Total draws.</param>
    /// <param name="losses">Total losses.</param>
    /// <param name="goalsFor">Goals scored.</param>
    /// <param name="goalsAgainst">Goals conceded.</param>
    /// <returns>A populated <see cref="StandingRow"/> instance.</returns>
    public static StandingRow Create(
        Guid groupId,
        Team team,
        int played,
        int wins,
        int draws,
        int losses,
        int goalsFor,
        int goalsAgainst)
    {
        if (team is null)
        {
            throw new ArgumentNullException(nameof(team));
        }

        var points = wins * 3 + draws;
        return new StandingRow(groupId, team.Id, team.Name, played, wins, draws, losses, goalsFor, goalsAgainst, points);
    }
}
