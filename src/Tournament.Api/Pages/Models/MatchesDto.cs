using System.Text.Json.Serialization;

namespace Tournament.Api.Pages.Models;

/// <summary>
/// Envelope returned by the matches endpoint.
/// </summary>
public sealed class MatchesEnvelopeDto
{
    [JsonPropertyName("groupId")]
    public Guid GroupId { get; set; }

    [JsonPropertyName("matches")]
    public IReadOnlyList<MatchDto> Matches { get; set; } = Array.Empty<MatchDto>();

    [JsonPropertyName("correlationId")]
    public Guid CorrelationId { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>
/// Represents a match returned by the API.
/// </summary>
public sealed class MatchDto
{
    [JsonPropertyName("matchId")]
    public Guid MatchId { get; set; }

    [JsonPropertyName("round")]
    public int Round { get; set; }

    [JsonPropertyName("homeTeamId")]
    public Guid HomeTeamId { get; set; }

    [JsonPropertyName("awayTeamId")]
    public Guid AwayTeamId { get; set; }

    [JsonPropertyName("scheduledKickoff")]
    public DateTimeOffset ScheduledKickoff { get; set; }

    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("homeScore")]
    public int? HomeScore { get; set; }

    [JsonPropertyName("awayScore")]
    public int? AwayScore { get; set; }
}
