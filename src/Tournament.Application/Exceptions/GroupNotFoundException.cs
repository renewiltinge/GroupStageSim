namespace Tournament.Application.Exceptions;

/// <summary>
/// Represents an error when a requested group cannot be located.
/// </summary>
public sealed class GroupNotFoundException : Exception
{
    /// <summary>
    /// Initializes a new instance of the <see cref="GroupNotFoundException"/> class.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    public GroupNotFoundException(Guid groupId)
        : base($"Group {groupId} was not found.")
    {
        GroupId = groupId;
    }

    /// <summary>
    /// Gets the identifier of the missing group.
    /// </summary>
    public Guid GroupId { get; }
}
