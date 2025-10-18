namespace GroupStageSim.Contracts;

/// <summary>
/// Event emitted by the simulation engine when a match outcome has been produced.
/// </summary>
/// <param name="MatchId">Identifier of the simulated match.</param>
/// <param name="GroupId">Group containing the match.</param>
/// <param name="HomeScore">Goals scored by the home team.</param>
/// <param name="AwayScore">Goals scored by the away team.</param>
/// <param name="Iteration">Simulation iteration that produced this result.</param>
/// <param name="CompletedAt">Timestamp when simulation finished.</param>
/// <param name="CorrelationId">Correlation identifier for trace alignment.</param>
public sealed record MatchPlayed(
    Guid MatchId,
    Guid GroupId,
    int HomeScore,
    int AwayScore,
    int Iteration,
    DateTimeOffset CompletedAt,
    Guid CorrelationId);
