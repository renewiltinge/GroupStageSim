using Tournament.Domain.Entities;

namespace Tournament.Application.Abstractions;

/// <summary>
/// Provides persistence capabilities for simulation job tracking.
/// </summary>
public interface ISimulationJobRepository
{
    /// <summary>
    /// Persists a newly created simulation job.
    /// </summary>
    /// <param name="job">Simulation job instance.</param>
    /// <param name="cancellationToken">Termination token.</param>
    Task AddAsync(SimulationJob job, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves the most recent simulation job for the specified group, if any.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Simulation job when available.</returns>
    Task<SimulationJob?> GetLatestByGroupAsync(Guid groupId, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves a simulation job by correlation identifier.
    /// </summary>
    /// <param name="correlationId">Correlation identifier associated with the job.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Simulation job when available.</returns>
    Task<SimulationJob?> GetByCorrelationIdAsync(Guid correlationId, CancellationToken cancellationToken);

    /// <summary>
    /// Persists updated state for the provided simulation job.
    /// </summary>
    /// <param name="job">Simulation job to persist.</param>
    /// <param name="cancellationToken">Termination token.</param>
    Task UpdateAsync(SimulationJob job, CancellationToken cancellationToken);

    /// <summary>
    /// Deletes all simulation jobs associated with the specified group.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    Task DeleteByGroupIdAsync(Guid groupId, CancellationToken cancellationToken);

    /// <summary>
    /// Persists pending changes.
    /// </summary>
    /// <param name="cancellationToken">Termination token.</param>
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
