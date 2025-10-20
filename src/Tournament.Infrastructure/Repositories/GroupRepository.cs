using Microsoft.EntityFrameworkCore;
using Tournament.Application.Abstractions;
using Tournament.Domain.Entities;
using Tournament.Infrastructure.Mappers;
using Tournament.Infrastructure.Persistence;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IGroupRepository"/>.
/// </summary>
public sealed class GroupRepository : IGroupRepository
{
    private readonly GroupStageSimDbContext dbContext;

    /// <summary>
    /// Initializes a new instance of the <see cref="GroupRepository"/> class.
    /// </summary>
    /// <param name="dbContext">EF Core DbContext.</param>
    public GroupRepository(GroupStageSimDbContext dbContext)
    {
        this.dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    /// <inheritdoc />
    public async Task AddAsync(Group group, CancellationToken cancellationToken)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        var entity = GroupMapper.ToData(group);
        await dbContext.Groups.AddAsync(entity, cancellationToken).ConfigureAwait(false);
    }

    /// <inheritdoc />
    public async Task<Group?> GetAsync(Guid groupId, bool includeMatches, CancellationToken cancellationToken)
    {
        IQueryable<GroupData> query = dbContext.Groups
            .Include(group => group.Teams);

        if (includeMatches)
        {
            query = query.Include(group => group.Matches);
        }

        var entity = await query
            .AsNoTracking()
            .SingleOrDefaultAsync(group => group.Id == groupId, cancellationToken)
            .ConfigureAwait(false);

        return entity is null ? null : GroupMapper.ToDomain(entity);
    }

    /// <inheritdoc />
    public async Task UpdateAsync(Group group, CancellationToken cancellationToken)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        var entity = await dbContext.Groups
            .Include(data => data.Teams)
            .Include(data => data.Matches)
            .SingleOrDefaultAsync(data => data.Id == group.Id, cancellationToken)
            .ConfigureAwait(false);

        if (entity is null)
        {
            throw new InvalidOperationException($"Group {group.Id} could not be found for update.");
        }

        GroupMapper.Apply(group, entity);
    }

    /// <inheritdoc />
    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
