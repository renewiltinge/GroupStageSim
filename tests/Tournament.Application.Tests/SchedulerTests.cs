using FluentAssertions;
using Tournament.Domain.Entities;
using Tournament.Domain.Services;

namespace Tournament.Application.Tests;

public class SchedulerTests
{
    [Fact]
    public void CreateSchedule_WithNullGroup_Throws()
    {
        var scheduler = new SchedulerService();

        Action act = () => scheduler.CreateSchedule(null!, DateTimeOffset.UtcNow);
        act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void CreateSchedule_ForFourTeams_ProducesSixUniqueFixturesOverThreeRounds()
    {
        var teams = Enumerable.Range(0, 4)
            .Select(i => new Team(Guid.NewGuid(), $"Team {i+1}", 1.0 + i * 0.1))
            .ToList();

        var group = new Group(Guid.NewGuid(), "Group A", teams);
            var scheduler = new SchedulerService();
        var firstKickoff = new DateTimeOffset(2025, 1, 1, 12, 0, 0, TimeSpan.Zero);

        var fixtures = scheduler.CreateSchedule(group, firstKickoff);

        fixtures.Should().HaveCount(6);

        // All fixtures unique (unordered pair uniqueness)
        fixtures
            .Select(m => new { A = m.HomeTeamId, B = m.AwayTeamId })
            .Distinct()
            .Should().HaveCount(6);

        // Rounds 1..3 each containing 2 matches
        fixtures.Select(m => m.Round).Distinct().Should().BeEquivalentTo(new[] {1,2,3});
        fixtures.GroupBy(m => m.Round).Should().OnlyContain(g => g.Count() == 2);

        // Chronological ordering (each subsequent kickoff exactly +1 day)
        fixtures.OrderBy(m => m.ScheduledKickoff).Select(m => m.ScheduledKickoff).Should()
            .BeInAscendingOrder();
        fixtures
            .OrderBy(m => m.ScheduledKickoff)
            .Select((m, idx) => m.ScheduledKickoff - firstKickoff - TimeSpan.FromDays(idx))
            .Should().OnlyContain(delta => delta == TimeSpan.Zero);

        // No team plays twice in the same round
        foreach (var round in fixtures.GroupBy(f => f.Round))
        {
            var teamAppearances = round.SelectMany(m => new[] { m.HomeTeamId, m.AwayTeamId });
            teamAppearances.Distinct().Should().HaveCount(4, "each team should appear exactly once per round");
        }
    }

}
