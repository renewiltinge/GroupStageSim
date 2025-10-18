namespace Tournament.Domain.Entities;

/// <summary>
/// Represents a tournament group with teams, matches, and standings state.
/// </summary>
public sealed class Group
{
    private readonly List<Team> teams = new();
    private readonly List<Match> matches = new();

    public Group(Guid id, string name, IEnumerable<Team> participants)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Group identifier cannot be empty.", nameof(id));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Group name cannot be empty.", nameof(name));
        }

        if (participants is null)
        {
            throw new ArgumentNullException(nameof(participants));
        }

        var participantList = participants.ToList();
        if (participantList.Count != 4)
        {
            throw new ArgumentException("A group must contain exactly four teams.", nameof(participants));
        }

        if (participantList.Select(p => p.Id).Distinct().Count() != 4)
        {
            throw new ArgumentException("Team identifiers within a group must be unique.", nameof(participants));
        }

        Id = id;
        Name = name;
        teams.AddRange(participantList);
    }

    public Guid Id { get; }

    public string Name { get; }

    public IReadOnlyCollection<Team> Teams => teams.AsReadOnly();

    public IReadOnlyCollection<Match> Matches => matches.AsReadOnly();

    /// <summary>
    /// Registers scheduled matches for the group while preventing duplicates.
    /// </summary>
    /// <param name="fixtures">The fixtures to append.</param>
    public void AddMatches(IEnumerable<Match> fixtures)
    {
        if (fixtures is null)
        {
            throw new ArgumentNullException(nameof(fixtures));
        }

        foreach (var match in fixtures)
        {
            if (matches.Any(existing => existing.Id == match.Id))
            {
                continue;
            }

            matches.Add(match);
        }
    }

    /// <summary>
    /// Locates a match by identifier.
    /// </summary>
    /// <param name="matchId">The target match identifier.</param>
    /// <returns>The requested match.</returns>
    public Match GetMatch(Guid matchId)
    {
        var match = matches.SingleOrDefault(m => m.Id == matchId);
        if (match is null)
        {
            throw new InvalidOperationException($"Match {matchId} does not exist in group {Id}.");
        }

        return match;
    }
}
