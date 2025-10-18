using Tournament.Domain.Entities;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Mappers;

/// <summary>
/// Provides mapping helpers between domain aggregates and persistence models.
/// </summary>
public static class GroupMapper
{
    /// <summary>
    /// Maps a domain group into its persistence counterpart.
    /// </summary>
    /// <param name="group">Domain group.</param>
    /// <returns>Persistence model.</returns>
    public static GroupData ToData(Group group)
    {
        var data = new GroupData
        {
            Id = group.Id,
            Name = group.Name,
            CreatedAt = DateTimeOffset.UtcNow
        };

        foreach (var team in group.Teams)
        {
            data.Teams.Add(new TeamData
            {
                Id = team.Id,
                GroupId = group.Id,
                Name = team.Name,
                Strength = team.Strength
            });
        }

        foreach (var match in group.Matches)
        {
            data.Matches.Add(new MatchData
            {
                Id = match.Id,
                GroupId = group.Id,
                HomeTeamId = match.HomeTeamId,
                AwayTeamId = match.AwayTeamId,
                Round = match.Round,
                ScheduledKickoff = match.ScheduledKickoff,
                Status = match.Status,
                HomeScore = match.HomeScore,
                AwayScore = match.AwayScore
            });
        }

        return data;
    }

    /// <summary>
    /// Maps persistence models back into the rich domain aggregate.
    /// </summary>
    /// <param name="groupData">Persistence model.</param>
    /// <returns>Domain group aggregate.</returns>
    public static Group ToDomain(GroupData groupData)
    {
        var teams = groupData.Teams
            .OrderBy(team => team.Name, StringComparer.Ordinal)
            .Select(team => new Team(team.Id, team.Name, team.Strength))
            .ToList();

        var group = new Group(groupData.Id, groupData.Name, teams);

        var matches = groupData.Matches
            .OrderBy(match => match.Round)
            .ThenBy(match => match.ScheduledKickoff)
            .Select(matchData =>
            {
                var match = new Match(
                    matchData.Id,
                    matchData.GroupId,
                    matchData.HomeTeamId,
                    matchData.AwayTeamId,
                    matchData.Round,
                    matchData.ScheduledKickoff);

                if (matchData.Status == MatchStatus.Played && matchData.HomeScore.HasValue && matchData.AwayScore.HasValue)
                {
                    match.ApplyResult(matchData.HomeScore.Value, matchData.AwayScore.Value);
                }

                return match;
            })
            .ToList();

        group.AddMatches(matches);
        return group;
    }
}
