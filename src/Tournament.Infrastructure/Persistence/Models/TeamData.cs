namespace Tournament.Infrastructure.Persistence.Models;

/// <summary>
/// EF Core persistence model for teams.
/// </summary>
public sealed class TeamData
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }

    public string Name { get; set; } = string.Empty;

    public double Strength { get; set; }

    public GroupData Group { get; set; } = null!;
}
