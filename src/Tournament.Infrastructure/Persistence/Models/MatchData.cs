using Tournament.Domain.Entities;

namespace Tournament.Infrastructure.Persistence.Models;

/// <summary>
/// EF Core persistence model for matches.
/// </summary>
public sealed class MatchData
{
    public Guid Id { get; set; }

    public Guid GroupId { get; set; }

    public Guid HomeTeamId { get; set; }

    public Guid AwayTeamId { get; set; }

    public int Round { get; set; }

    public DateTimeOffset ScheduledKickoff { get; set; }

    public MatchStatus Status { get; set; }

    public int? HomeScore { get; set; }

    public int? AwayScore { get; set; }

    public GroupData Group { get; set; } = null!;
}
