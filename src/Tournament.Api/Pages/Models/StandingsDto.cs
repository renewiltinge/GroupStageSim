using System.Text.Json.Serialization;

namespace Tournament.Api.Pages.Models;

/// <summary>
/// Envelope returned by the standings endpoint.
/// </summary>
public sealed class StandingsEnvelopeDto
{
    [JsonPropertyName("groupId")]
    public Guid GroupId { get; set; }

    [JsonPropertyName("roundsCompleted")]
    public int RoundsCompleted { get; set; }

    [JsonPropertyName("rows")]
    public IReadOnlyList<StandingRowDto> Rows { get; set; } = Array.Empty<StandingRowDto>();

    [JsonPropertyName("correlationId")]
    public Guid CorrelationId { get; set; }

    [JsonPropertyName("updatedAt")]
    public DateTimeOffset UpdatedAt { get; set; }
}

/// <summary>
/// Represents a standings row as exposed by the API.
/// </summary>
public sealed class StandingRowDto
{
    [JsonPropertyName("teamId")]
    public Guid TeamId { get; set; }

    [JsonPropertyName("teamName")]
    public string TeamName { get; set; } = string.Empty;

    [JsonPropertyName("played")]
    public int Played { get; set; }

    [JsonPropertyName("wins")]
    public int Wins { get; set; }

    [JsonPropertyName("draws")]
    public int Draws { get; set; }

    [JsonPropertyName("losses")]
    public int Losses { get; set; }

    [JsonPropertyName("goalsFor")]
    public int GoalsFor { get; set; }

    [JsonPropertyName("goalsAgainst")]
    public int GoalsAgainst { get; set; }

    [JsonPropertyName("goalDifference")]
    public int GoalDifference { get; set; }

    [JsonPropertyName("points")]
    public int Points { get; set; }
}
