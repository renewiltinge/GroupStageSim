using System.Text.Json.Serialization;

namespace Tournament.Api.Pages.Models;

/// <summary>
/// Represents the simulation status payload consumed by the Razor UI.
/// </summary>
public sealed class SimulationStatusDto
{
    [JsonPropertyName("groupId")]
    public Guid GroupId { get; set; }

    [JsonPropertyName("correlationId")]
    public Guid? CorrelationId { get; set; }

    [JsonPropertyName("state")]
    public string State { get; set; } = "idle";

    [JsonPropertyName("iterations")]
    public int? Iterations { get; set; }

    [JsonPropertyName("matchesTotal")]
    public int? MatchesTotal { get; set; }

    [JsonPropertyName("matchesCompleted")]
    public int? MatchesCompleted { get; set; }

    [JsonPropertyName("queuedAt")]
    public DateTimeOffset? QueuedAt { get; set; }

    [JsonPropertyName("startedAt")]
    public DateTimeOffset? StartedAt { get; set; }

    [JsonPropertyName("completedAt")]
    public DateTimeOffset? CompletedAt { get; set; }

    [JsonPropertyName("lastUpdatedAt")]
    public DateTimeOffset? LastUpdatedAt { get; set; }

    [JsonPropertyName("estimatedSecondsRemaining")]
    public double? EstimatedSecondsRemaining { get; set; }

    [JsonPropertyName("explanation")]
    public string? Explanation { get; set; }
}
