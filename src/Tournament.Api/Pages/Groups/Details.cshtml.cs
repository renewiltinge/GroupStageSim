using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Tournament.Api.Pages.Models;

namespace Tournament.Api.Pages.Groups;

/// <summary>
/// Page model that visualises group standings and match results by calling the public API.
/// </summary>
public sealed class DetailsModel : PageModel
{
    private const string DefaultGroupLabelFormat = "Group {0}";

    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<DetailsModel> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="DetailsModel"/> class.
    /// </summary>
    /// <param name="httpClientFactory">Factory used to create HTTP clients.</param>
    /// <param name="logger">Logger instance.</param>
    public DetailsModel(IHttpClientFactory httpClientFactory, ILogger<DetailsModel> logger)
    {
        this.httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets the identifier of the group being displayed.
    /// </summary>
    public Guid GroupId { get; private set; }

    /// <summary>
    /// Gets the friendly display name for the group.
    /// </summary>
    public string GroupName { get; private set; } = string.Empty;

    /// <summary>
    /// Gets the standings snapshot fetched from the API.
    /// </summary>
    public IReadOnlyList<StandingRowDto> Standings { get; private set; } = Array.Empty<StandingRowDto>();

    /// <summary>
    /// Gets the match list fetched from the API.
    /// </summary>
    public IReadOnlyList<MatchDto> Matches { get; private set; } = Array.Empty<MatchDto>();

    /// <summary>
    /// Gets a lookup table of team identifiers to names for rendering purposes.
    /// </summary>
    public IReadOnlyDictionary<Guid, string> TeamNames { get; private set; } = new Dictionary<Guid, string>();

    /// <summary>
    /// Gets the latest simulation status payload for client-side hydration.
    /// </summary>
    public SimulationStatusDto? SimulationStatus { get; private set; }

    /// <summary>
    /// Gets a JSON payload containing the initial state required by the client-side script.
    /// </summary>
    public string InitialStateJson { get; private set; } = "{}";

    /// <summary>
    /// Handles GET requests by fetching the latest standings and matches.
    /// </summary>
    /// <param name="id">Group identifier supplied via query string.</param>
    /// <param name="cancellationToken">Propagation token.</param>
    /// <returns>HTTP result.</returns>
    public async Task<IActionResult> OnGetAsync(Guid id, CancellationToken cancellationToken)
    {
        if (id == Guid.Empty)
        {
            ViewData["ErrorMessage"] = "A valid group identifier is required.";
            return Page();
        }

        GroupId = id;
    GroupName = ResolveGroupName(id);
    ApplyTeamNamesFromCache();

        try
        {
            var client = httpClientFactory.CreateClient();
            client.BaseAddress = new Uri($"{Request.Scheme}://{Request.Host}");

            using var standingsResponse = await client.GetAsync($"/groups/{id}/standings", cancellationToken).ConfigureAwait(false);
            using var matchesResponse = await client.GetAsync($"/groups/{id}/matches", cancellationToken).ConfigureAwait(false);
            using var statusResponse = await client.GetAsync($"/groups/{id}/simulation-status", cancellationToken).ConfigureAwait(false);

            var standingsResult = await ProcessStandingsAsync(standingsResponse, cancellationToken).ConfigureAwait(false);
            var matchesResult = await ProcessMatchesAsync(matchesResponse, cancellationToken).ConfigureAwait(false);
            await ProcessSimulationStatusAsync(statusResponse, cancellationToken).ConfigureAwait(false);

            if (!standingsResult && !matchesResult)
            {
                ViewData["ErrorMessage"] = "Unable to load data for this group.";
            }

            BuildInitialState();
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to reach the API when loading group {GroupId}", id);
            ViewData["ErrorMessage"] = "Network error while contacting the API.";
        }

        return Page();
    }

    /// <summary>
    /// Resolves a friendly group name using cached data or an inferred fallback.
    /// </summary>
    /// <param name="id">Group identifier.</param>
    /// <returns>Display label.</returns>
    private string ResolveGroupName(Guid id)
    {
        if (TempData.Peek("GroupName") is string cached && !string.IsNullOrWhiteSpace(cached))
        {
            return cached;
        }

        if (Request.Query.TryGetValue("name", out var queryName) && !string.IsNullOrWhiteSpace(queryName))
        {
            return queryName!;
        }

        return string.Format(DefaultGroupLabelFormat, id.ToString("N")[..8].ToUpperInvariant());
    }

    /// <summary>
    /// Processes the standings response and populates the page state.
    /// </summary>
    /// <param name="response">HTTP response returned by the API.</param>
    /// <param name="cancellationToken">Propagation token.</param>
    /// <returns><see langword="true"/> when standings were successfully loaded.</returns>
    private async Task<bool> ProcessStandingsAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            var envelope = await response.Content.ReadFromJsonAsync<StandingsEnvelopeDto>(cancellationToken: cancellationToken).ConfigureAwait(false);
            if (envelope is not null)
            {
                Standings = envelope.Rows
                    .OrderByDescending(row => row.Points)
                    .ThenByDescending(row => row.GoalDifference)
                    .ThenByDescending(row => row.GoalsFor)
                    .ThenBy(row => row.TeamName)
                    .ToList();

                TeamNames = Standings.ToDictionary(row => row.TeamId, row => row.TeamName);
                return true;
            }
        }
        else
        {
            await HandleProblemDetailsAsync(response, cancellationToken).ConfigureAwait(false);
        }

        return false;
    }

    /// <summary>
    /// Processes the matches response and populates the page state.
    /// </summary>
    /// <param name="response">HTTP response returned by the API.</param>
    /// <param name="cancellationToken">Propagation token.</param>
    /// <returns><see langword="true"/> when matches were successfully loaded.</returns>
    private async Task<bool> ProcessMatchesAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            var envelope = await response.Content.ReadFromJsonAsync<MatchesEnvelopeDto>(cancellationToken: cancellationToken).ConfigureAwait(false);
            if (envelope is not null)
            {
                Matches = envelope.Matches
                    .OrderBy(match => match.Round)
                    .ThenBy(match => match.ScheduledKickoff)
                    .ToList();

                if (TeamNames.Count == 0 && Matches.Count > 0)
                {
                    TeamNames = Matches
                        .SelectMany(match => new[] { match.HomeTeamId, match.AwayTeamId })
                        .Distinct()
                        .ToDictionary(teamId => teamId, teamId => teamId.ToString("N"));
                }

                return true;
            }
        }
        else
        {
            await HandleProblemDetailsAsync(response, cancellationToken).ConfigureAwait(false);
        }

        return false;
    }

    /// <summary>
    /// Attempts to surface problem details returned by the API to the reviewer.
    /// </summary>
    /// <param name="response">HTTP response returned by the API.</param>
    /// <param name="cancellationToken">Propagation token.</param>
    private async Task HandleProblemDetailsAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.Content.Headers.ContentType?.MediaType == "application/problem+json")
        {
            var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(cancellationToken: cancellationToken).ConfigureAwait(false);
            if (problem is not null)
            {
                ViewData["ErrorMessage"] = $"{problem.Title ?? "Request failed"}: {problem.Detail ?? "See logs for details."}";
                return;
            }
        }

        ViewData["ErrorMessage"] = $"The API returned status code {(int)response.StatusCode}.";
    }

    /// <summary>
    /// Serialises the initial state to hydrate the client-side script.
    /// </summary>
    private void BuildInitialState()
    {
        var payload = new
        {
            groupId = GroupId,
            groupName = GroupName,
            standings = Standings,
            matches = Matches,
            teamNames = TeamNames,
            simulationStatus = SimulationStatus
        };

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        InitialStateJson = JsonSerializer.Serialize(payload, options);
    }

    /// <summary>
    /// Processes the simulation status response from the API.
    /// </summary>
    /// <param name="response">HTTP response returned by the API.</param>
    /// <param name="cancellationToken">Propagation token.</param>
    private async Task ProcessSimulationStatusAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            SimulationStatus = await response.Content.ReadFromJsonAsync<SimulationStatusDto>(cancellationToken: cancellationToken).ConfigureAwait(false);
            return;
        }

        await HandleProblemDetailsAsync(response, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Applies team names stored in TempData so the UI can render labels before simulations finish.
    /// </summary>
    private void ApplyTeamNamesFromCache()
    {
        if (TempData.Peek("TeamNames") is not string cached || string.IsNullOrWhiteSpace(cached))
        {
            return;
        }

        try
        {
            var teams = JsonSerializer.Deserialize<IReadOnlyList<TeamDto>>(cached, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (teams is not null && teams.Count > 0)
            {
                TeamNames = teams.ToDictionary(team => team.Id, team => team.Name);
            }
        }
        catch (JsonException ex)
        {
            logger.LogWarning(ex, "Failed to read team names from TempData for group {GroupId}", GroupId);
        }
    }
}
