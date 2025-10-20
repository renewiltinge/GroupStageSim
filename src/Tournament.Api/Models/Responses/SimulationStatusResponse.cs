namespace Tournament.Api.Models.Responses;

/// <summary>
/// Represents the public-facing simulation progress payload.
/// </summary>
public sealed class SimulationStatusResponse
{
    /// <summary>
    /// Gets or sets the group identifier.
    /// </summary>
    public Guid GroupId { get; init; }

    /// <summary>
    /// Gets or sets the simulation correlation identifier when available.
    /// </summary>
    public Guid? CorrelationId { get; init; }

    /// <summary>
    /// Gets or sets the high-level state of the simulation (idle, queued, running, completed).
    /// </summary>
    public string State { get; init; } = "idle";

    /// <summary>
    /// Gets or sets the number of iterations requested.
    /// </summary>
    public int? Iterations { get; init; }

    /// <summary>
    /// Gets or sets the total number of matches participating in the simulation.
    /// </summary>
    public int? MatchesTotal { get; init; }

    /// <summary>
    /// Gets or sets the number of matches that have finished processing.
    /// </summary>
    public int? MatchesCompleted { get; init; }

    /// <summary>
    /// Gets or sets the timestamp for when the simulation was queued.
    /// </summary>
    public DateTimeOffset? QueuedAt { get; init; }

    /// <summary>
    /// Gets or sets the timestamp for when processing started.
    /// </summary>
    public DateTimeOffset? StartedAt { get; init; }

    /// <summary>
    /// Gets or sets the timestamp for when processing completed, if applicable.
    /// </summary>
    public DateTimeOffset? CompletedAt { get; init; }

    /// <summary>
    /// Gets or sets the timestamp for the last progress update.
    /// </summary>
    public DateTimeOffset? LastUpdatedAt { get; init; }

    /// <summary>
    /// Gets or sets the estimated number of seconds remaining before completion.
    /// </summary>
    public double? EstimatedSecondsRemaining { get; init; }

    /// <summary>
    /// Gets or sets a human-friendly explanation of the current state.
    /// </summary>
    public string? Explanation { get; init; }
}
