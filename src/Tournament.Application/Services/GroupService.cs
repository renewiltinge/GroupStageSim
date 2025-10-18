using GroupStageSim.Contracts;
using Tournament.Application.Abstractions;
using Tournament.Application.Exceptions;
using Tournament.Application.Models;
using Tournament.Domain.Entities;
using Tournament.Domain.Services;

namespace Tournament.Application.Services;

/// <summary>
/// Coordinates group creation, scheduling, simulation triggers, and standings queries.
/// </summary>
public sealed class GroupService
{
    private readonly IGroupRepository groupRepository;
    private readonly IMessageBus messageBus;
    private readonly Scheduler scheduler;
    private readonly RankingService rankingService;
    private readonly MatchResultApplier matchResultApplier;

    /// <summary>
    /// Initializes a new instance of the <see cref="GroupService"/> class.
    /// </summary>
    /// <param name="groupRepository">Repository abstraction for group persistence.</param>
    /// <param name="messageBus">Message bus abstraction.</param>
    /// <param name="scheduler">Domain scheduler service.</param>
    /// <param name="rankingService">Domain ranking service.</param>
    /// <param name="matchResultApplier">Domain match result applier.</param>
    public GroupService(
        IGroupRepository groupRepository,
        IMessageBus messageBus,
        Scheduler scheduler,
        RankingService rankingService,
        MatchResultApplier matchResultApplier)
    {
        this.groupRepository = groupRepository ?? throw new ArgumentNullException(nameof(groupRepository));
        this.messageBus = messageBus ?? throw new ArgumentNullException(nameof(messageBus));
        this.scheduler = scheduler ?? throw new ArgumentNullException(nameof(scheduler));
        this.rankingService = rankingService ?? throw new ArgumentNullException(nameof(rankingService));
        this.matchResultApplier = matchResultApplier ?? throw new ArgumentNullException(nameof(matchResultApplier));
    }

    /// <summary>
    /// Creates a new group aggregate, schedules fixtures, and persists the result.
    /// </summary>
    /// <param name="command">Creation payload.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>The created group aggregate.</returns>
    public async Task<Group> CreateGroupAsync(CreateGroupCommand command, CancellationToken cancellationToken)
    {
        if (command is null)
        {
            throw new ArgumentNullException(nameof(command));
        }

        var teams = command.Teams.Select(team => new Team(team.Id, team.Name, team.Strength)).ToList();
        var group = new Group(Guid.NewGuid(), command.Name, teams);
        var matches = scheduler.CreateSchedule(group, DateTimeOffset.UtcNow);
        group.AddMatches(matches);

        await groupRepository.AddAsync(group, cancellationToken).ConfigureAwait(false);
        await groupRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        return group;
    }

    /// <summary>
    /// Publishes simulation requests for scheduled matches in the specified group.
    /// </summary>
    /// <param name="groupId">Target group identifier.</param>
    /// <param name="iterations">Number of Monte Carlo iterations.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Correlation identifier for downstream tracking.</returns>
    public async Task<Guid> TriggerSimulationAsync(Guid groupId, int iterations, CancellationToken cancellationToken)
    {
        if (iterations <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(iterations), iterations, "Iterations must be greater than zero.");
        }

        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        var correlationId = Guid.NewGuid();
        foreach (var match in group.Matches.Where(m => m.Status == MatchStatus.Scheduled))
        {
            var message = new MatchScheduled(
                match.Id,
                group.Id,
                match.HomeTeamId,
                match.AwayTeamId,
                match.Round,
                match.ScheduledKickoff,
                iterations,
                correlationId);

            await messageBus.PublishAsync(message, cancellationToken).ConfigureAwait(false);
        }

        return correlationId;
    }

    /// <summary>
    /// Computes the latest standings for the requested group.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Ordered standings rows.</returns>
    public async Task<IReadOnlyCollection<StandingRow>> GetStandingsAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        var standings = rankingService.CalculateStandings(group, group.Matches);
        return standings;
    }

    /// <summary>
    /// Retrieves all matches for the requested group.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Collection of matches.</returns>
    public async Task<IReadOnlyCollection<Match>> GetMatchesAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        return group.Matches.OrderBy(match => match.Round).ThenBy(match => match.ScheduledKickoff).ToList();
    }

    /// <summary>
    /// Applies a match result and recomputes standings.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="matchId">Match identifier.</param>
    /// <param name="homeScore">Home goals scored.</param>
    /// <param name="awayScore">Away goals scored.</param>
    /// <param name="cancellationToken">Termination token.</param>
    public async Task ApplyMatchResultAsync(Guid groupId, Guid matchId, int homeScore, int awayScore, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        matchResultApplier.Apply(group, matchId, homeScore, awayScore);
        await groupRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}
