namespace Tournament.Api.Models.Responses;

/// <summary>
/// Represents a group resource returned by the API.
/// </summary>
public sealed class GroupResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public IReadOnlyCollection<TeamResponse> Teams { get; init; } = Array.Empty<TeamResponse>();

    public DateTimeOffset CreatedAt { get; init; }

    public Guid CorrelationId { get; init; }
}

/// <summary>
/// Represents a team view model inside API responses.
/// </summary>
public sealed class TeamResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public double Strength { get; init; }
}
