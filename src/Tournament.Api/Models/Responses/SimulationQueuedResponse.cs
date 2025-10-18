namespace Tournament.Api.Models.Responses;

/// <summary>
/// Response returned when a simulation request has been queued.
/// </summary>
public sealed class SimulationQueuedResponse
{
    public Guid GroupId { get; init; }

    public int Iterations { get; init; }

    public Guid CorrelationId { get; init; }

    public string Status { get; init; } = "Queued";
}
