namespace Tournament.Api.Models.Responses;

/// <summary>
/// Response envelope for group standings.
/// </summary>
public sealed class StandingsResponse
{
    public Guid GroupId { get; init; }

    public int RoundsCompleted { get; init; }

    public IReadOnlyCollection<StandingRowResponse> Rows { get; init; } = Array.Empty<StandingRowResponse>();

    public Guid CorrelationId { get; init; }

    public DateTimeOffset UpdatedAt { get; init; }
}

/// <summary>
/// Individual standings row projection.
/// </summary>
public sealed class StandingRowResponse
{
    public Guid TeamId { get; init; }

    public string TeamName { get; init; } = string.Empty;

    public int Played { get; init; }

    public int Wins { get; init; }

    public int Draws { get; init; }

    public int Losses { get; init; }

    public int GoalsFor { get; init; }

    public int GoalsAgainst { get; init; }

    public int GoalDifference { get; init; }

    public int Points { get; init; }
}
