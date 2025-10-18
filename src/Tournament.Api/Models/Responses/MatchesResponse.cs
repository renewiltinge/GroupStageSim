using Tournament.Domain.Entities;

namespace Tournament.Api.Models.Responses;

/// <summary>
/// Response envelope for match listings.
/// </summary>
public sealed class MatchesResponse
{
    public Guid GroupId { get; init; }

    public IReadOnlyCollection<MatchResponse> Matches { get; init; } = Array.Empty<MatchResponse>();

    public Guid CorrelationId { get; init; }

    public DateTimeOffset UpdatedAt { get; init; }
}

/// <summary>
/// Match projection for API consumers.
/// </summary>
public sealed class MatchResponse
{
    public Guid MatchId { get; init; }

    public int Round { get; init; }

    public Guid HomeTeamId { get; init; }

    public Guid AwayTeamId { get; init; }

    public DateTimeOffset ScheduledKickoff { get; init; }

    public MatchStatus Status { get; init; }

    public int? HomeScore { get; init; }

    public int? AwayScore { get; init; }
}
