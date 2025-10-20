using Tournament.Domain.Entities;

namespace Tournament.Application.Models;

/// <summary>
/// Represents a snapshot of simulation job progress for a specific group.
/// </summary>
public sealed record SimulationStatus
(
    Guid GroupId,
    Guid CorrelationId,
    SimulationJobStatus Status,
    int Iterations,
    int MatchesTotal,
    int MatchesCompleted,
    DateTimeOffset QueuedAt,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    DateTimeOffset LastUpdatedAt,
    TimeSpan? EstimatedRemaining,
    string? Explanation
);
