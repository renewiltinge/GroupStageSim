namespace Tournament.Domain.Entities;

/// <summary>
/// Represents a scheduled or completed match in the tournament lifecycle.
/// </summary>
public sealed class Match
{
    public Match(Guid id, Guid groupId, Guid homeTeamId, Guid awayTeamId, int round, DateTimeOffset scheduledKickoff)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Match identifier cannot be empty.", nameof(id));
        }

        if (groupId == Guid.Empty)
        {
            throw new ArgumentException("Group identifier cannot be empty.", nameof(groupId));
        }

        if (homeTeamId == Guid.Empty || awayTeamId == Guid.Empty)
        {
            throw new ArgumentException("Team identifiers cannot be empty.");
        }

        if (homeTeamId == awayTeamId)
        {
            throw new ArgumentException("Matches must contain distinct teams.");
        }

        if (round <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(round), round, "Round must be a positive integer.");
        }

        Id = id;
        GroupId = groupId;
        HomeTeamId = homeTeamId;
        AwayTeamId = awayTeamId;
        Round = round;
        ScheduledKickoff = scheduledKickoff;
        Status = MatchStatus.Scheduled;
    }

    public Guid Id { get; }

    public Guid GroupId { get; }

    public Guid HomeTeamId { get; }

    public Guid AwayTeamId { get; }

    public int Round { get; }

    public DateTimeOffset ScheduledKickoff { get; private set; }

    public MatchStatus Status { get; private set; }

    public int? HomeScore { get; private set; }

    public int? AwayScore { get; private set; }

    /// <summary>
    /// Applies a simulated result to the match and marks it as played.
    /// </summary>
    /// <param name="homeScore">Home goals scored.</param>
    /// <param name="awayScore">Away goals scored.</param>
    public void ApplyResult(int homeScore, int awayScore)
    {
        if (homeScore < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(homeScore), homeScore, "Score cannot be negative.");
        }

        if (awayScore < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(awayScore), awayScore, "Score cannot be negative.");
        }

        HomeScore = homeScore;
        AwayScore = awayScore;
        Status = MatchStatus.Played;
    }

    /// <summary>
    /// Updates the scheduled kickoff to support rescheduling requirements.
    /// </summary>
    /// <param name="kickoff">New kickoff timestamp.</param>
    public void Reschedule(DateTimeOffset kickoff)
    {
        if (kickoff == DateTimeOffset.MinValue)
        {
            throw new ArgumentException("Kickoff must be a valid timestamp.", nameof(kickoff));
        }

        ScheduledKickoff = kickoff;
    }

    /// <summary>
    /// Resets the match back to scheduled state with no score.
    /// </summary>
    public void Reset()
    {
        HomeScore = null;
        AwayScore = null;
        Status = MatchStatus.Scheduled;
    }
}
