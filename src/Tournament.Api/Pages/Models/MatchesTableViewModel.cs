namespace Tournament.Api.Pages.Models;

/// <summary>
/// Provides data required to render the matches table.
/// </summary>
public sealed class MatchesTableViewModel
{
    /// <summary>
    /// Initializes a new instance of the <see cref="MatchesTableViewModel"/> class.
    /// </summary>
    /// <param name="matches">Match collection to render.</param>
    /// <param name="teamNames">Lookup table mapping team identifiers to display names.</param>
    public MatchesTableViewModel(IReadOnlyList<MatchDto> matches, IReadOnlyDictionary<Guid, string> teamNames)
    {
        Matches = matches;
        TeamNames = teamNames;
    }

    public IReadOnlyList<MatchDto> Matches { get; }

    public IReadOnlyDictionary<Guid, string> TeamNames { get; }
}
