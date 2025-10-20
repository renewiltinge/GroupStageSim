namespace GroupStageSim.Contracts;

/// <summary>
/// Event emitted when the scheduler publishes a new match to the simulation queue.
/// </summary>
/// <param name="MatchId">Identifier of the scheduled match.</param>
/// <param name="GroupId">Group containing the match.</param>
/// <param name="HomeTeamId">Home team identifier.</param>
/// <param name="AwayTeamId">Away team identifier.</param>
/// <param name="Round">Matchday number.</param>
/// <param name="ScheduledKickoff">Scheduled kickoff timestamp for the fixture.</param>
/// <param name="Iteration">Simulation iteration currently being processed.</param>
/// <param name="Iterations">Total number of Monte Carlo iterations requested.</param>
/// <param name="CorrelationId">Correlation identifier for request tracing.</param>
/// <param name="StrengthHome">Relative strength rating for the home team.</param>
/// <param name="StrengthAway">Relative strength rating for the away team.</param>
public sealed record MatchScheduled(
    Guid MatchId,
    Guid GroupId,
    Guid HomeTeamId,
    Guid AwayTeamId,
    int Round,
    DateTimeOffset ScheduledKickoff,
    int Iteration,
    int Iterations,
    Guid CorrelationId,
    double StrengthHome,
    double StrengthAway);
