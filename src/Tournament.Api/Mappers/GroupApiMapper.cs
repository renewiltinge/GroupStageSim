using Tournament.Api.Models.Responses;
using Tournament.Domain.Entities;

namespace Tournament.Api.Mappers;

/// <summary>
/// Maps domain entities into API response models.
/// </summary>
public static class GroupApiMapper
{
    /// <summary>
    /// Maps a group aggregate to its API representation.
    /// </summary>
    /// <param name="group">Domain group.</param>
    /// <param name="correlationId">Correlation identifier for traceability.</param>
    /// <returns>API response.</returns>
    public static GroupResponse ToGroupResponse(Group group, Guid correlationId)
    {
        return new GroupResponse
        {
            Id = group.Id,
            Name = group.Name,
            Teams = group.Teams
                .OrderBy(team => team.Name, StringComparer.Ordinal)
                .Select(team => new TeamResponse
                {
                    Id = team.Id,
                    Name = team.Name,
                    Strength = team.Strength
                })
                .ToList(),
            CreatedAt = DateTimeOffset.UtcNow,
            CorrelationId = correlationId
        };
    }

    /// <summary>
    /// Converts standings into API responses.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="rows">Standing rows.</param>
    /// <param name="matches">Matches used for metadata.</param>
    /// <param name="correlationId">Correlation identifier.</param>
    /// <returns>Standings response.</returns>
    public static StandingsResponse ToStandingsResponse(Guid groupId, IReadOnlyCollection<StandingRow> rows, IReadOnlyCollection<Match> matches, Guid correlationId)
    {
        var roundsCompleted = matches
            .Where(match => match.Status == MatchStatus.Played)
            .Select(match => match.Round)
            .DefaultIfEmpty(0)
            .Max();

        return new StandingsResponse
        {
            GroupId = groupId,
            RoundsCompleted = roundsCompleted,
            Rows = rows.Select(row => new StandingRowResponse
            {
                TeamId = row.TeamId,
                TeamName = row.TeamName,
                Played = row.Played,
                Wins = row.Wins,
                Draws = row.Draws,
                Losses = row.Losses,
                GoalsFor = row.GoalsFor,
                GoalsAgainst = row.GoalsAgainst,
                GoalDifference = row.GoalDifference,
                Points = row.Points
            }).ToList(),
            CorrelationId = correlationId,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    /// <summary>
    /// Maps match collections into API responses.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="matches">Matches to project.</param>
    /// <param name="correlationId">Correlation identifier.</param>
    /// <returns>Match list response.</returns>
    public static MatchesResponse ToMatchesResponse(Guid groupId, IReadOnlyCollection<Match> matches, Guid correlationId)
    {
        return new MatchesResponse
        {
            GroupId = groupId,
            Matches = matches.Select(match => new MatchResponse
            {
                MatchId = match.Id,
                Round = match.Round,
                HomeTeamId = match.HomeTeamId,
                AwayTeamId = match.AwayTeamId,
                ScheduledKickoff = match.ScheduledKickoff,
                Status = match.Status,
                HomeScore = match.HomeScore,
                AwayScore = match.AwayScore
            }).ToList(),
            CorrelationId = correlationId,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }
}
