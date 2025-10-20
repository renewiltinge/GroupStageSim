using Tournament.Domain.Entities;

namespace Tournament.Infrastructure.Persistence.Models;

/// <summary>
/// Database model used to persist simulation job progress.
/// </summary>
public sealed class SimulationJobData
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }

    public Guid CorrelationId { get; set; }

    public int Iterations { get; set; }

    public int MatchesTotal { get; set; }

    public int MatchesCompleted { get; set; }

    public SimulationJobStatus Status { get; set; }

    public DateTimeOffset QueuedAt { get; set; }

    public DateTimeOffset? StartedAt { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset LastUpdatedAt { get; set; }

    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
