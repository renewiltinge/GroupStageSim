using Tournament.Domain.Entities;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Mappers;

/// <summary>
/// Provides projection helpers between domain and persistence models for simulation jobs.
/// </summary>
public static class SimulationJobMapper
{
    /// <summary>
    /// Projects a domain simulation job to its data model.
    /// </summary>
    /// <param name="job">Domain job.</param>
    /// <returns>Data transfer model.</returns>
    public static SimulationJobData ToData(SimulationJob job)
    {
        if (job is null)
        {
            throw new ArgumentNullException(nameof(job));
        }

        return new SimulationJobData
        {
            Id = job.Id,
            GroupId = job.GroupId,
            CorrelationId = job.CorrelationId,
            Iterations = job.Iterations,
            MatchesTotal = job.MatchesTotal,
            MatchesCompleted = job.MatchesCompleted,
            Status = job.Status,
            QueuedAt = job.QueuedAt,
            StartedAt = job.StartedAt,
            CompletedAt = job.CompletedAt,
            LastUpdatedAt = job.LastUpdatedAt
        };
    }

    /// <summary>
    /// Projects a data model into the domain representation.
    /// </summary>
    /// <param name="data">Data entity.</param>
    /// <returns>Domain entity.</returns>
    public static SimulationJob ToDomain(SimulationJobData data)
    {
        if (data is null)
        {
            throw new ArgumentNullException(nameof(data));
        }

        return new SimulationJob(
            data.Id,
            data.GroupId,
            data.CorrelationId,
            data.Iterations,
            data.MatchesTotal,
            data.MatchesCompleted,
            data.Status,
            data.QueuedAt,
            data.StartedAt,
            data.CompletedAt,
            data.LastUpdatedAt);
    }

    /// <summary>
    /// Applies the domain state onto an existing persistence entity.
    /// </summary>
    /// <param name="job">Domain entity.</param>
    /// <param name="data">Persistence entity.</param>
    public static void Apply(SimulationJob job, SimulationJobData data)
    {
        if (job is null)
        {
            throw new ArgumentNullException(nameof(job));
        }

        if (data is null)
        {
            throw new ArgumentNullException(nameof(data));
        }

        data.GroupId = job.GroupId;
        data.CorrelationId = job.CorrelationId;
        data.Iterations = job.Iterations;
        data.MatchesTotal = job.MatchesTotal;
        data.MatchesCompleted = job.MatchesCompleted;
        data.Status = job.Status;
        data.QueuedAt = job.QueuedAt;
        data.StartedAt = job.StartedAt;
        data.CompletedAt = job.CompletedAt;
        data.LastUpdatedAt = job.LastUpdatedAt;
    }
}
