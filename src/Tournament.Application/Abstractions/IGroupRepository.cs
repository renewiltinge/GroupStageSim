using Tournament.Domain.Entities;

namespace Tournament.Application.Abstractions;

/// <summary>
/// Provides CRUD operations for group aggregates and related entities.
/// </summary>
public interface IGroupRepository
{
    /// <summary>
    /// Persists a new group aggregate.
    /// </summary>
    /// <param name="group">Group aggregate.</param>
    /// <param name="cancellationToken">Termination token.</param>
    Task AddAsync(Group group, CancellationToken cancellationToken);

    /// <summary>
    /// Retrieves a group with optional match tracking.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="includeMatches">When true, includes match collection.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>The requested group if found.</returns>
    Task<Group?> GetAsync(Guid groupId, bool includeMatches, CancellationToken cancellationToken);

    /// <summary>
    /// Persists pending changes to the underlying store.
    /// </summary>
    /// <param name="cancellationToken">Termination token.</param>
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
