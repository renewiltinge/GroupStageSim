using System.ComponentModel.DataAnnotations;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Tournament.Api.Pages.Models;

namespace Tournament.Api.Pages.Groups;

/// <summary>
/// Page model responsible for creating tournament groups through the public API.
/// </summary>
public sealed class CreateModel : PageModel
{
    private readonly IHttpClientFactory httpClientFactory;
    private readonly ILogger<CreateModel> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="CreateModel"/> class.
    /// </summary>
    /// <param name="httpClientFactory">Factory for configuring HTTP clients.</param>
    /// <param name="logger">Logger instance.</param>
    public CreateModel(IHttpClientFactory httpClientFactory, ILogger<CreateModel> logger)
    {
        this.httpClientFactory = httpClientFactory ?? throw new ArgumentNullException(nameof(httpClientFactory));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Gets or sets the form input for rendering and validation.
    /// </summary>
    [BindProperty]
    public CreateGroupInput Input { get; set; } = CreateGroupInput.CreateDefault();

    /// <summary>
    /// Handles GET requests by ensuring the default team seed values are available.
    /// </summary>
    public void OnGet()
    {
        if (Input.Teams.Count == 0)
        {
            Input = CreateGroupInput.CreateDefault();
        }
    }

    /// <summary>
    /// Handles POST requests by invoking the API to create a new group.
    /// </summary>
    /// <param name="cancellationToken">Propagation token.</param>
    /// <returns>Redirect to details page on success or the current page on validation errors.</returns>
    public async Task<IActionResult> OnPostAsync(CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        if (Input.Teams.Count != 4)
        {
            ModelState.AddModelError(string.Empty, "Exactly four teams are required.");
            return Page();
        }

        if (Input.Teams.Any(team => team.Strength <= 0))
        {
            ModelState.AddModelError(string.Empty, "Team strengths must be greater than zero.");
            return Page();
        }

        try
        {
            var client = httpClientFactory.CreateClient();
            client.BaseAddress = new Uri($"{Request.Scheme}://{Request.Host}");

            var payload = new
            {
                name = Input.Name.Trim(),
                teams = Input.Teams.Select(team => new
                {
                    id = Guid.NewGuid(),
                    name = team.Name.Trim(),
                    strength = team.Strength
                }).ToList()
            };

            using var response = await client.PostAsJsonAsync("/groups", payload, cancellationToken).ConfigureAwait(false);
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<GroupDto>(cancellationToken: cancellationToken).ConfigureAwait(false);
                if (result is null)
                {
                    ViewData["ErrorMessage"] = "The API responded without data. Please try again.";
                    return Page();
                }

                TempData["StatusMessage"] = $"Group '{result.Name}' created.";
                TempData["GroupName"] = result.Name;
                TempData["TeamNames"] = JsonSerializer.Serialize(result.Teams, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
                return RedirectToPage("/Groups/Details", new { id = result.Id });
            }

            if (response.Content.Headers.ContentType?.MediaType == "application/problem+json")
            {
                var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(cancellationToken: cancellationToken).ConfigureAwait(false);
                ViewData["ErrorMessage"] = problem is null
                    ? "The API returned an error."
                    : $"{problem.Title ?? "Request failed"}: {problem.Detail ?? "See logs for details."}";
            }
            else
            {
                ViewData["ErrorMessage"] = $"The API returned status code {(int)response.StatusCode}.";
            }
        }
        catch (HttpRequestException ex)
        {
            logger.LogError(ex, "Failed to reach the API while creating a group.");
            ViewData["ErrorMessage"] = "Network error while contacting the API.";
        }

        return Page();
    }

    /// <summary>
    /// Represents the form payload required to create a group.
    /// </summary>
    public sealed class CreateGroupInput
    {
        /// <summary>
        /// Gets or sets the group name entered by the reviewer.
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the collection of teams included in the group.
        /// </summary>
        [MinLength(4)]
        [MaxLength(4)]
        public IList<TeamInput> Teams { get; set; } = new List<TeamInput>();

        /// <summary>
        /// Creates a default payload with four seeded teams.
        /// </summary>
        /// <returns>Pre-populated input.</returns>
        public static CreateGroupInput CreateDefault()
        {
            return new CreateGroupInput
            {
                Name = "Group A",
                Teams = new List<TeamInput>
                {
                    new("Alpha", 1.6),
                    new("Bravo", 1.3),
                    new("Charlie", 1.0),
                    new("Delta", 0.8)
                }
            };
        }
    }

    /// <summary>
    /// Represents the team input captured from the UI.
    /// </summary>
    public sealed class TeamInput
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="TeamInput"/> class.
        /// </summary>
        public TeamInput()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="TeamInput"/> class with seed values.
        /// </summary>
        /// <param name="name">Team name.</param>
        /// <param name="strength">Team strength value.</param>
        public TeamInput(string name, double strength)
        {
            Name = name;
            Strength = strength;
        }

        /// <summary>
        /// Gets or sets the display name of the team.
        /// </summary>
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the strength modifier for the team.
        /// </summary>
        [Range(0.1, 3.0)]
        public double Strength { get; set; } = 1.0;
    }
}
