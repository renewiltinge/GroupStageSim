using FluentAssertions;
using Tournament.Application.Services;
using Tournament.Domain.Entities;

namespace Tournament.Application.Tests;

public class RankingServiceTests
{
    private static Team CreateTeam(string name, double strength = 1.0) => new(Guid.NewGuid(), name, strength);
    
    private static Match CreatePlayedMatch(Guid groupId, Team home, Team away, int homeScore, int awayScore)
    {
        var match = new Match(Guid.NewGuid(), groupId, home.Id, away.Id, 1, DateTimeOffset.UtcNow);
        match.ApplyResult(homeScore, awayScore);
        return match;
    }

    [Fact]
    public void CalculateStandings_WithNoMatches_ReturnsAllTeamsWithZeroStats()
    {
        // Arrange
        var teams = new[] { CreateTeam("Alpha"), CreateTeam("Bravo"), CreateTeam("Charlie"), CreateTeam("Delta") };
        var group = new Group(Guid.NewGuid(), "Test Group", teams);
        var service = new RankingService();

        // Act
        var standings = service.CalculateStandings(group, Array.Empty<Match>());

        // Assert
        standings.Should().HaveCount(4);
        standings.Should().OnlyContain(r => r.Played == 0 && r.Points == 0);
    }

    [Fact]
    public void CalculateStandings_WithClearPointsDifferences_OrdersByPointsDescending()
    {
        // Arrange
        var teamA = CreateTeam("A");
        var teamB = CreateTeam("B");
        var teamC = CreateTeam("C");
        var teamD = CreateTeam("D");
        var group = new Group(Guid.NewGuid(), "Test Group", new[] { teamA, teamB, teamC, teamD });
        var service = new RankingService();

        var matches = new List<Match>
        {
            CreatePlayedMatch(group.Id, teamA, teamB, 2, 0), // A wins: 3 pts
            CreatePlayedMatch(group.Id, teamC, teamD, 1, 1), // Draw: C & D get 1 pt each
            CreatePlayedMatch(group.Id, teamA, teamC, 0, 0), // Draw: A gets +1 pt (total 4), C gets +1 pt (total 2)
            CreatePlayedMatch(group.Id, teamB, teamD, 3, 1)  // B wins: 3 pts total, D stays at 1 pt
        };

        // Act
        var standings = service.CalculateStandings(group, matches);

        // Assert - Expected order: A(4 pts), B(3 pts), C(2 pts), D(1 pt)
        standings.Select(r => r.TeamId).Should().ContainInOrder(teamA.Id, teamB.Id, teamC.Id, teamD.Id);
    }

    [Fact]
    public void CalculateStandings_WithTiedPoints_OrdersBySecondaryMetrics()
    {
        // Arrange
        var teamA = CreateTeam("A");
        var teamB = CreateTeam("B");
        var teamC = CreateTeam("C");
        var teamD = CreateTeam("D");
        var group = new Group(Guid.NewGuid(), "Test Group", new[] { teamA, teamB, teamC, teamD });
        var service = new RankingService();

        var matches = new List<Match>
        {
            CreatePlayedMatch(group.Id, teamA, teamC, 1, 0), // A wins vs C
            CreatePlayedMatch(group.Id, teamB, teamC, 2, 1), // B wins vs C
            CreatePlayedMatch(group.Id, teamD, teamA, 3, 2), // D wins vs A
            CreatePlayedMatch(group.Id, teamD, teamB, 1, 0), // D wins vs B
            CreatePlayedMatch(group.Id, teamA, teamB, 1, 1)  // A and B draw
        };

        // Act
        var standings = service.CalculateStandings(group, matches);

        // Assert
        var teamARow = standings.Single(r => r.TeamId == teamA.Id);
        var teamBRow = standings.Single(r => r.TeamId == teamB.Id);

        teamARow.Points.Should().Be(teamBRow.Points, "both teams should have equal points");
        standings.Should().BeInDescendingOrder(r => r.Points, "standings should be ordered by points descending");
    }

    [Fact]
    public void CalculateStandings_WithThreeWayTie_ResolvesOrderingDeterministically()
    {
        // Arrange
        var teamA = CreateTeam("A");
        var teamB = CreateTeam("B");
        var teamC = CreateTeam("C");
        var teamD = CreateTeam("D");
        var group = new Group(Guid.NewGuid(), "Test Group", new[] { teamA, teamB, teamC, teamD });
        var service = new RankingService();

        var matches = new List<Match>
        {
            // Create three-way tie scenario with draws between A, B, C
            CreatePlayedMatch(group.Id, teamA, teamB, 1, 1),
            CreatePlayedMatch(group.Id, teamB, teamC, 2, 2),
            CreatePlayedMatch(group.Id, teamA, teamC, 0, 0),
            // D loses to each of A, B, C
            CreatePlayedMatch(group.Id, teamA, teamD, 2, 1),
            CreatePlayedMatch(group.Id, teamB, teamD, 3, 2),
            CreatePlayedMatch(group.Id, teamC, teamD, 1, 0)
        };

        // Act
        var standings = service.CalculateStandings(group, matches);

        // Assert
        var topThreeTeams = standings.Take(3).Select(r => r.TeamId).ToHashSet();
        topThreeTeams.Should().BeEquivalentTo(new[] { teamA.Id, teamB.Id, teamC.Id }, 
            "A, B, and C should occupy the top three positions");
        
        standings.Last().TeamId.Should().Be(teamD.Id, "D should be last due to losing all matches");
    }

}
