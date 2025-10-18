namespace GroupStageSim.Contracts;

/// <summary>
/// Event emitted when the scheduler publishes a new match to the simulation queue.
/// </summary>
/// <param name="MatchId">Identifier of the scheduled match.</param>
/// <param name="GroupId">Group containing the match.</param>
/// <param name="HomeTeamId">Home team identifier.</param>
/// <param name="AwayTeamId">Away team identifier.</param>
/// <param name="Round">Matchday number.</param>
/// <param name="ScheduledKickoff">Kickoff timestamp in UTC.</param>
/// <param name="Iterations">Number of simulation iterations requested.</param>
/// <param name="CorrelationId">Correlation identifier for request tracing.</param>
public sealed record MatchScheduled(
    Guid MatchId,
    Guid GroupId,
    Guid HomeTeamId,
    Guid AwayTeamId,
    int Round,
    DateTimeOffset ScheduledKickoff,
    int Iterations,
    Guid CorrelationId);
