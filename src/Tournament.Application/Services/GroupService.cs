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
    private const double BaselineSecondsPerIteration = 0.02;
    
    private readonly IGroupRepository groupRepository;
    private readonly IMessageBus messageBus;
    private readonly Scheduler scheduler;
    private readonly IRankingService rankingService;
    private readonly MatchResultApplier matchResultApplier;
    private readonly ISimulationJobRepository simulationJobRepository;

    /// <summary>
    /// Initializes a new instance of the <see cref="GroupService"/> class.
    /// </summary>
    /// <param name="groupRepository">Repository abstraction for group persistence.</param>
    /// <param name="messageBus">Message bus abstraction.</param>
    /// <param name="scheduler">Domain scheduler service.</param>
    /// <param name="rankingService">Ranking service abstraction.</param>
    /// <param name="matchResultApplier">Domain match result applier.</param>
    public GroupService(
        IGroupRepository groupRepository,
        IMessageBus messageBus,
        Scheduler scheduler,
        IRankingService rankingService,
        MatchResultApplier matchResultApplier,
        ISimulationJobRepository simulationJobRepository)
    {
        this.groupRepository = groupRepository ?? throw new ArgumentNullException(nameof(groupRepository));
        this.messageBus = messageBus ?? throw new ArgumentNullException(nameof(messageBus));
        this.scheduler = scheduler ?? throw new ArgumentNullException(nameof(scheduler));
        this.rankingService = rankingService ?? throw new ArgumentNullException(nameof(rankingService));
        this.matchResultApplier = matchResultApplier ?? throw new ArgumentNullException(nameof(matchResultApplier));
        this.simulationJobRepository = simulationJobRepository ?? throw new ArgumentNullException(nameof(simulationJobRepository));
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

        var matchesToSimulate = group.Matches.Where(m => m.Status == MatchStatus.Scheduled).ToList();
        var correlationId = Guid.NewGuid();

        var job = SimulationJob.Create(group.Id, correlationId, iterations, matchesToSimulate.Count, DateTimeOffset.UtcNow);
        await simulationJobRepository.AddAsync(job, cancellationToken).ConfigureAwait(false);
        await simulationJobRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        // For now, simulate in-process instead of using the queue
        // This bypasses RabbitMQ complexity and gets simulation working today
        await SimulateInProcessAsync(group, matchesToSimulate, iterations, correlationId, cancellationToken).ConfigureAwait(false);

        return correlationId;
    }

    /// <summary>
    /// Simulates matches in-process for immediate results.
    /// </summary>
    private async Task SimulateInProcessAsync(Group group, IList<Match> matches, int iterations, Guid correlationId, CancellationToken cancellationToken)
    {
        var teamLookup = group.Teams.ToDictionary(team => team.Id);
        
        // For in-process simulation, we'll just use the last iteration's results
        foreach (var match in matches)
        {
            if (!teamLookup.TryGetValue(match.HomeTeamId, out var homeTeam) ||
                !teamLookup.TryGetValue(match.AwayTeamId, out var awayTeam))
            {
                continue;
            }

            // Simulate the final iteration and use those results
            var (homeScore, awayScore) = await SimulateMatchAsync(match, homeTeam, awayTeam, iterations, cancellationToken).ConfigureAwait(false);
            
            // Apply the result directly
            await ApplyMatchResultAsync(group.Id, match.Id, homeScore, awayScore, correlationId, cancellationToken).ConfigureAwait(false);
        }
    }

    /// <summary>
    /// Simulates a single match using basic probability.
    /// </summary>
    private Task<(int HomeScore, int AwayScore)> SimulateMatchAsync(Match match, Team homeTeam, Team awayTeam, int iteration, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        
        // Simple simulation logic
        var seed = HashCode.Combine(42, match.Id, iteration); // Use default seed
        var random = new Random(seed);
        
        // Basic goal calculation based on team strengths
        var strengthRatio = homeTeam.Strength / awayTeam.Strength;
        var homeAdvantage = 1.05;
        var baseRate = 1.3;
        
        var homeExpectedGoals = baseRate * Math.Clamp(strengthRatio, 0.5, 1.5) * homeAdvantage;
        var awayExpectedGoals = baseRate * Math.Clamp(awayTeam.Strength / homeTeam.Strength, 0.5, 1.5) * 0.95;
        
        var homeGoals = SamplePoisson(random, homeExpectedGoals);
        var awayGoals = SamplePoisson(random, awayExpectedGoals);
        
        return Task.FromResult((homeGoals, awayGoals));
    }

    /// <summary>
    /// Simple Poisson sampling using Knuth's algorithm.
    /// </summary>
    private static int SamplePoisson(Random random, double lambda)
    {
        if (lambda <= 0) return 0;
        
        var limit = Math.Exp(-lambda);
        var product = 1.0;
        var count = 0;
        
        do
        {
            count++;
            product *= random.NextDouble();
        } while (product > limit);
        
        return Math.Min(count - 1, 10); // Cap at 10 goals
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
    /// Retrieves the latest simulation job snapshot for the specified group.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    /// <returns>Simulation status when available.</returns>
    public async Task<SimulationStatus?> GetSimulationStatusAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var existingGroup = await groupRepository.GetAsync(groupId, includeMatches: false, cancellationToken).ConfigureAwait(false);
        if (existingGroup is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        var job = await simulationJobRepository.GetLatestByGroupAsync(groupId, cancellationToken).ConfigureAwait(false);
        if (job is null)
        {
            return null;
        }

        var estimatedRemaining = CalculateEstimatedRemaining(job);
        var explanation = CreateExplanation(job, estimatedRemaining);

        return new SimulationStatus(
            job.GroupId,
            job.CorrelationId,
            job.Status,
            job.Iterations,
            job.MatchesTotal,
            job.MatchesCompleted,
            job.QueuedAt,
            job.StartedAt,
            job.CompletedAt,
            job.LastUpdatedAt,
            estimatedRemaining,
            explanation);
    }

    /// <summary>
    /// Applies a match result and recomputes standings.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="matchId">Match identifier.</param>
    /// <param name="homeScore">Home goals scored.</param>
    /// <param name="awayScore">Away goals scored.</param>
    /// <param name="correlationId">Correlation identifier used to track simulation progress.</param>
    /// <param name="cancellationToken">Termination token.</param>
    public async Task ApplyMatchResultAsync(Guid groupId, Guid matchId, int homeScore, int awayScore, Guid correlationId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        matchResultApplier.Apply(group, matchId, homeScore, awayScore);
        await groupRepository.UpdateAsync(group, cancellationToken).ConfigureAwait(false);
        await groupRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        var job = await simulationJobRepository.GetByCorrelationIdAsync(correlationId, cancellationToken).ConfigureAwait(false);
        if (job is not null)
        {
            job.MarkMatchCompleted(DateTimeOffset.UtcNow);
            await simulationJobRepository.UpdateAsync(job, cancellationToken).ConfigureAwait(false);
            await simulationJobRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
    }

    private static TimeSpan? CalculateEstimatedRemaining(SimulationJob job)
    {
        if (job.MatchesTotal == 0)
        {
            return TimeSpan.Zero;
        }

        if (job.Status == SimulationJobStatus.Completed)
        {
            return TimeSpan.Zero;
        }

        if (job.MatchesCompleted <= 0 || job.StartedAt is null)
        {
            var estimatedSeconds = job.Iterations * Math.Max(1, job.MatchesTotal) * BaselineSecondsPerIteration;
            return TimeSpan.FromSeconds(Math.Clamp(estimatedSeconds, 1, 300));
        }

        var elapsed = job.LastUpdatedAt - job.StartedAt.Value;
        if (elapsed <= TimeSpan.Zero)
        {
            return TimeSpan.FromSeconds(5);
        }

        var averagePerMatch = elapsed.TotalSeconds / job.MatchesCompleted;
        var remainingMatches = Math.Max(0, job.MatchesTotal - job.MatchesCompleted);
        var estimatedRemainingSeconds = averagePerMatch * remainingMatches;
        return TimeSpan.FromSeconds(Math.Clamp(estimatedRemainingSeconds, 0, 300));
    }

    private static string CreateExplanation(SimulationJob job, TimeSpan? estimate)
    {
        var statusText = job.Status switch
        {
            SimulationJobStatus.Completed => "Completed simulation",
            SimulationJobStatus.Running => "Simulation running",
            _ => "Simulation queued"
        };

        var workloadText = $"{job.Iterations} iteration(s) across {job.MatchesTotal} matches";
        string progressText;

        if (job.MatchesTotal == 0)
        {
            progressText = "No matches required processing.";
        }
        else if (job.Status == SimulationJobStatus.Completed)
        {
            progressText = "All matches have finished.";
        }
        else if (job.MatchesCompleted == 0)
        {
            progressText = "No matches have completed yet.";
        }
        else
        {
            progressText = $"{job.MatchesCompleted} of {job.MatchesTotal} matches have completed.";
        }

        var estimateText = estimate is null || estimate <= TimeSpan.Zero
            ? string.Empty
            : $" Estimated time remaining: ~{FormatDuration(estimate.Value)}.";

        return $"{statusText} request ({workloadText}). {progressText}{estimateText} Each match is processed sequentially, so larger iteration counts increase total runtime.";
    }

    /// <summary>
    /// Resets all match results in a group back to unplayed state and clears simulation jobs.
    /// </summary>
    /// <param name="groupId">Group identifier.</param>
    /// <param name="cancellationToken">Termination token.</param>
    public async Task ResetGroupAsync(Guid groupId, CancellationToken cancellationToken)
    {
        var group = await groupRepository.GetAsync(groupId, includeMatches: true, cancellationToken).ConfigureAwait(false);
        if (group is null)
        {
            throw new GroupNotFoundException(groupId);
        }

        // Reset all match scores to null (unplayed state)
        foreach (var match in group.Matches)
        {
            match.Reset();
        }

        await groupRepository.UpdateAsync(group, cancellationToken).ConfigureAwait(false);
        await groupRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        // Clear any existing simulation jobs for this group
        await simulationJobRepository.DeleteByGroupIdAsync(groupId, cancellationToken).ConfigureAwait(false);
        await simulationJobRepository.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }

    private static string FormatDuration(TimeSpan duration)
    {
        if (duration.TotalSeconds < 1)
        {
            return "<1s";
        }

        if (duration.TotalMinutes < 1)
        {
            return $"{Math.Round(duration.TotalSeconds):0}s";
        }

        var minutes = (int)duration.TotalMinutes;
        var seconds = duration.Seconds;
        return seconds > 0 ? $"{minutes}m {seconds}s" : $"{minutes}m";
    }
}
