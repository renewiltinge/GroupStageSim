using System.Text.Json.Serialization;

namespace Tournament.Api.Pages.Models;

/// <summary>
/// Represents the response returned when a simulation is queued.
/// </summary>
public sealed class SimulationQueuedDto
{
    [JsonPropertyName("groupId")]
    public Guid GroupId { get; set; }

    [JsonPropertyName("iterations")]
    public int Iterations { get; set; }

    [JsonPropertyName("correlationId")]
    public Guid CorrelationId { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
}
