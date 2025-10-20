using System.Text.Json.Serialization;

namespace Tournament.Api.Pages.Models;

/// <summary>
/// Represents a group payload returned from the public API.
/// </summary>
public sealed class GroupDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("teams")]
    public IReadOnlyList<TeamDto> Teams { get; set; } = Array.Empty<TeamDto>();

    [JsonPropertyName("createdAt")]
    public DateTimeOffset CreatedAt { get; set; }

    [JsonPropertyName("correlationId")]
    public Guid CorrelationId { get; set; }
}

/// <summary>
/// Represents a team projection consumed by the UI.
/// </summary>
public sealed class TeamDto
{
    [JsonPropertyName("id")]
    public Guid Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("strength")]
    public double Strength { get; set; }
}
