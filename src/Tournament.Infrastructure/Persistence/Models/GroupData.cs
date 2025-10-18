namespace Tournament.Infrastructure.Persistence.Models;

/// <summary>
/// EF Core persistence model for groups.
/// </summary>
public sealed class GroupData
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; set; }
        = DateTimeOffset.UtcNow;

    public ICollection<TeamData> Teams { get; set; } = new List<TeamData>();

    public ICollection<MatchData> Matches { get; set; } = new List<MatchData>();
}
