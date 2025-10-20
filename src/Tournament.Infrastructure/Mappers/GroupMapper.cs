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

    /// <summary>
    /// Applies the domain group state onto an existing persistence entity.
    /// </summary>
    /// <param name="group">Domain group containing the latest state.</param>
    /// <param name="target">Tracked persistence entity to mutate.</param>
    public static void Apply(Group group, GroupData target)
    {
        if (group is null)
        {
            throw new ArgumentNullException(nameof(group));
        }

        if (target is null)
        {
            throw new ArgumentNullException(nameof(target));
        }

        target.Name = group.Name;

        var matchLookup = target.Matches.ToDictionary(match => match.Id);
        foreach (var domainMatch in group.Matches)
        {
            if (!matchLookup.TryGetValue(domainMatch.Id, out var matchData))
            {
                matchData = new MatchData
                {
                    Id = domainMatch.Id,
                    GroupId = target.Id
                };

                target.Matches.Add(matchData);
            }

            matchData.HomeTeamId = domainMatch.HomeTeamId;
            matchData.AwayTeamId = domainMatch.AwayTeamId;
            matchData.Round = domainMatch.Round;
            matchData.ScheduledKickoff = domainMatch.ScheduledKickoff;
            matchData.Status = domainMatch.Status;
            matchData.HomeScore = domainMatch.HomeScore;
            matchData.AwayScore = domainMatch.AwayScore;
        }
    }
}
