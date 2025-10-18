using Microsoft.AspNetCore.Mvc;
using Tournament.Api.Mappers;
using Tournament.Api.Models.Requests;
using Tournament.Api.Models.Responses;
using Tournament.Application.Exceptions;
using Tournament.Application.Models;
using Tournament.Application.Services;

namespace Tournament.Api.Controllers;

/// <summary>
/// Exposes endpoints for managing tournament groups and simulations.
/// </summary>
[ApiController]
[Route("groups")]
public sealed class GroupsController : ControllerBase
{
    private readonly GroupService groupService;
    private readonly ILogger<GroupsController> logger;

    /// <summary>
    /// Initializes a new instance of the <see cref="GroupsController"/> class.
    /// </summary>
    /// <param name="groupService">Application service for group operations.</param>
    /// <param name="logger">Logger instance.</param>
    public GroupsController(GroupService groupService, ILogger<GroupsController> logger)
    {
        this.groupService = groupService ?? throw new ArgumentNullException(nameof(groupService));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Creates a new group and schedules its fixtures.
    /// </summary>
    /// <param name="request">Request payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Created group representation.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(GroupResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGroupAsync([FromBody] CreateGroupRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateGroupCommand(
            request.Name,
            request.Teams.Select(team => new TeamSeed(team.Id, team.Name, team.Strength)).ToList());

        var group = await groupService.CreateGroupAsync(command, cancellationToken).ConfigureAwait(false);
        var correlationId = Guid.NewGuid();
        var response = GroupApiMapper.ToGroupResponse(group, correlationId);
        logger.LogInformation("Created group {GroupId} with correlationId {CorrelationId}", group.Id, correlationId);
        return CreatedAtAction(nameof(GetMatchesAsync), new { id = group.Id }, response);
    }

    /// <summary>
    /// Enqueues simulation jobs for a group.
    /// </summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="iterations">Number of Monte Carlo iterations.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Simulation status response.</returns>
    [HttpPost("{id:guid}/simulate")]
    [ProducesResponseType(typeof(SimulationQueuedResponse), StatusCodes.Status202Accepted)]
    public async Task<IActionResult> SimulateAsync(Guid id, [FromQuery] int iterations, CancellationToken cancellationToken)
    {
        try
        {
            var correlationId = await groupService.TriggerSimulationAsync(id, iterations, cancellationToken).ConfigureAwait(false);
            var response = new SimulationQueuedResponse
            {
                GroupId = id,
                Iterations = iterations,
                CorrelationId = correlationId
            };
            logger.LogInformation("Simulation queued for group {GroupId} with correlationId {CorrelationId}", id, correlationId);
            return Accepted(response);
        }
        catch (GroupNotFoundException ex)
        {
            return NotFound(CreateProblem(ex.Message, ex.GroupId));
        }
    }

    /// <summary>
    /// Retrieves the current standings for a group.
    /// </summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Standings response.</returns>
    [HttpGet("{id:guid}/standings")]
    [ProducesResponseType(typeof(StandingsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStandingsAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var standings = await groupService.GetStandingsAsync(id, cancellationToken).ConfigureAwait(false);
            var matches = await groupService.GetMatchesAsync(id, cancellationToken).ConfigureAwait(false);
            var correlationId = Guid.NewGuid();
            var response = GroupApiMapper.ToStandingsResponse(id, standings, matches, correlationId);
            return Ok(response);
        }
        catch (GroupNotFoundException ex)
        {
            return NotFound(CreateProblem(ex.Message, ex.GroupId));
        }
    }

    /// <summary>
    /// Retrieves all matches for a group.
    /// </summary>
    /// <param name="id">Group identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Matches response.</returns>
    [HttpGet("{id:guid}/matches")]
    [ProducesResponseType(typeof(MatchesResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMatchesAsync(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var matches = await groupService.GetMatchesAsync(id, cancellationToken).ConfigureAwait(false);
            var correlationId = Guid.NewGuid();
            var response = GroupApiMapper.ToMatchesResponse(id, matches, correlationId);
            return Ok(response);
        }
        catch (GroupNotFoundException ex)
        {
            return NotFound(CreateProblem(ex.Message, ex.GroupId));
        }
    }

    /// <summary>
    /// Creates a ProblemDetails payload for missing group scenarios.
    /// </summary>
    /// <param name="detail">Error detail.</param>
    /// <param name="groupId">Group identifier.</param>
    /// <returns>Problem details payload.</returns>
    private static ProblemDetails CreateProblem(string detail, Guid groupId)
    {
        return new ProblemDetails
        {
            Title = "Group not found",
            Detail = detail,
            Status = StatusCodes.Status404NotFound,
            Type = "https://httpstatuses.com/404",
            Instance = $"/groups/{groupId}"
        };
    }
}
