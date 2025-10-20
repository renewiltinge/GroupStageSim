using System.Linq;
using Microsoft.EntityFrameworkCore;
using Tournament.Application.Abstractions;
using Tournament.Domain.Entities;
using Tournament.Infrastructure.Mappers;
using Tournament.Infrastructure.Persistence;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="ISimulationJobRepository"/>.
/// </summary>
public sealed class SimulationJobRepository : ISimulationJobRepository
{
    private readonly GroupStageSimDbContext dbContext;

    /// <summary>
    /// Initializes a new instance of the <see cref="SimulationJobRepository"/> class.
    /// </summary>
    /// <param name="dbContext">Database context.</param>
    public SimulationJobRepository(GroupStageSimDbContext dbContext)
    {
        this.dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    /// <inheritdoc />
    public async Task AddAsync(SimulationJob job, CancellationToken cancellationToken)
    {
        if (job is null)
        {
            throw new ArgumentNullException(nameof(job));
        }

        var entity = SimulationJobMapper.ToData(job);
        await dbContext.SimulationJobs.AddAsync(entity, cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<SimulationJob?> GetLatestByGroupAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SimulationJobs
            .Where(job => job.GroupId == groupId)
            .OrderByDescending(job => job.QueuedAt)
            .ThenByDescending(job => job.LastUpdatedAt)
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);

        return entity is null ? null : SimulationJobMapper.ToDomain(entity);
    }

    /// <inheritdoc />
    public async Task<SimulationJob?> GetByCorrelationIdAsync(Guid correlationId, CancellationToken cancellationToken)
    {
        var entity = await dbContext.SimulationJobs
            .SingleOrDefaultAsync(job => job.CorrelationId == correlationId, cancellationToken)
            .ConfigureAwait(false);

        return entity is null ? null : SimulationJobMapper.ToDomain(entity);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(SimulationJob job, CancellationToken cancellationToken)
    {
        if (job is null)
        {
            throw new ArgumentNullException(nameof(job));
        }

        var entity = await dbContext.SimulationJobs
            .SingleOrDefaultAsync(data => data.Id == job.Id, cancellationToken)
            .ConfigureAwait(false);

        if (entity is null)
        {
            await dbContext.SimulationJobs.AddAsync(SimulationJobMapper.ToData(job), cancellationToken).ConfigureAwait(false);
            return;
        }

        SimulationJobMapper.Apply(job, entity);
    }

    /// <inheritdoc />
    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
