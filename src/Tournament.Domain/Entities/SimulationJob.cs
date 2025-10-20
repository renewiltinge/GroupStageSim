namespace Tournament.Domain.Entities;

/// <summary>
/// Represents the execution status of a simulation request for a tournament group.
/// </summary>
public sealed class SimulationJob
{
    public SimulationJob(
        Guid id,
        Guid groupId,
        Guid correlationId,
        int iterations,
        int matchesTotal,
        int matchesCompleted,
        SimulationJobStatus status,
        DateTimeOffset queuedAt,
        DateTimeOffset? startedAt,
        DateTimeOffset? completedAt,
        DateTimeOffset lastUpdatedAt)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Job identifier cannot be empty.", nameof(id));
        }

        if (groupId == Guid.Empty)
        {
            throw new ArgumentException("Group identifier cannot be empty.", nameof(groupId));
        }

        if (correlationId == Guid.Empty)
        {
            throw new ArgumentException("Correlation identifier cannot be empty.", nameof(correlationId));
        }

        if (iterations <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(iterations), iterations, "Iterations must be greater than zero.");
        }

        if (matchesTotal < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(matchesTotal), matchesTotal, "Match count cannot be negative.");
        }

        if (matchesCompleted < 0 || matchesCompleted > matchesTotal)
        {
            throw new ArgumentOutOfRangeException(nameof(matchesCompleted), matchesCompleted, "Completed matches must fall within the total range.");
        }

        Id = id;
        GroupId = groupId;
        CorrelationId = correlationId;
        Iterations = iterations;
        MatchesTotal = matchesTotal;
        MatchesCompleted = matchesCompleted;
        Status = status;
        QueuedAt = queuedAt;
        StartedAt = startedAt;
        CompletedAt = completedAt;
        LastUpdatedAt = lastUpdatedAt;
    }

    /// <summary>
    /// Gets the simulation job identifier.
    /// </summary>
    public Guid Id { get; }

    /// <summary>
    /// Gets the group identifier the simulation belongs to.
    /// </summary>
    public Guid GroupId { get; }

    /// <summary>
    /// Gets the correlation identifier shared across messages.
    /// </summary>
    public Guid CorrelationId { get; }

    /// <summary>
    /// Gets the total number of Monte Carlo iterations requested.
    /// </summary>
    public int Iterations { get; }

    /// <summary>
    /// Gets the total number of matches included in the simulation run.
    /// </summary>
    public int MatchesTotal { get; }

    /// <summary>
    /// Gets the number of matches that have completed processing.
    /// </summary>
    public int MatchesCompleted { get; private set; }

    /// <summary>
    /// Gets the current execution status.
    /// </summary>
    public SimulationJobStatus Status { get; private set; }

    /// <summary>
    /// Gets the timestamp for when the job was queued.
    /// </summary>
    public DateTimeOffset QueuedAt { get; }

    /// <summary>
    /// Gets the timestamp for when processing began, if known.
    /// </summary>
    public DateTimeOffset? StartedAt { get; private set; }

    /// <summary>
    /// Gets the timestamp for when processing completed, if applicable.
    /// </summary>
    public DateTimeOffset? CompletedAt { get; private set; }

    /// <summary>
    /// Gets the timestamp for the last recorded progress update.
    /// </summary>
    public DateTimeOffset LastUpdatedAt { get; private set; }

    /// <summary>
    /// Creates a new simulation job for the provided parameters.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="correlationId">Correlation identifier.</param>
    /// <param name="iterations">Iteration count.</param>
    /// <param name="matchesTotal">Total matches participating.</param>
    /// <param name="queuedAt">Queue timestamp.</param>
    /// <returns>New <see cref="SimulationJob"/> instance.</returns>
    public static SimulationJob Create(Guid groupId, Guid correlationId, int iterations, int matchesTotal, DateTimeOffset queuedAt)
    {
        var status = matchesTotal == 0 ? SimulationJobStatus.Completed : SimulationJobStatus.Queued;
        var completedAt = matchesTotal == 0 ? queuedAt : (DateTimeOffset?)null;
        var startedAt = matchesTotal == 0 ? queuedAt : (DateTimeOffset?)null;
        return new SimulationJob(
            Guid.NewGuid(),
            groupId,
            correlationId,
            iterations,
            matchesTotal,
            matchesTotal == 0 ? matchesTotal : 0,
            status,
            queuedAt,
            startedAt,
            completedAt,
            lastUpdatedAt: queuedAt);
    }

    /// <summary>
    /// Records completion progress for a match processed by the worker.
    /// </summary>
    /// <param name="timestamp">Timestamp when the match finished processing.</param>
    public void MarkMatchCompleted(DateTimeOffset timestamp)
    {
        if (MatchesCompleted >= MatchesTotal)
        {
            return;
        }

        StartedAt ??= timestamp;
        MatchesCompleted++;
        LastUpdatedAt = timestamp;
        Status = MatchesCompleted >= MatchesTotal ? SimulationJobStatus.Completed : SimulationJobStatus.Running;

        if (Status == SimulationJobStatus.Completed)
        {
            CompletedAt = timestamp;
            MatchesCompleted = MatchesTotal;
        }
    }
}
