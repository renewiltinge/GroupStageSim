using FluentAssertions;
using Tournament.Application.Models;
using Tournament.Domain.Entities;

namespace Tournament.Application.Tests;

public class SimulationJobTests
{
    [Fact]
    public void Create_WithZeroMatches_CompletesImmediately()
    {
        // Arrange
        var groupId = Guid.NewGuid();
        var correlationId = Guid.NewGuid();
        var queuedAt = DateTimeOffset.UtcNow;

        // Act
        var job = SimulationJob.Create(groupId, correlationId, 10, 0, queuedAt);

        // Assert
        job.Status.Should().Be(SimulationJobStatus.Completed);
        job.MatchesTotal.Should().Be(0);
        job.MatchesCompleted.Should().Be(0);
        job.CompletedAt.Should().Be(queuedAt);
        job.StartedAt.Should().Be(queuedAt);
    }

    [Fact]
    public void MarkMatchCompleted_WithTwoMatches_TransitionsFromQueuedToRunningToCompleted()
    {
        // Arrange
        var job = SimulationJob.Create(Guid.NewGuid(), Guid.NewGuid(), 5, 2, DateTimeOffset.UtcNow);
        var firstTimestamp = DateTimeOffset.UtcNow.AddSeconds(1);
        var secondTimestamp = firstTimestamp.AddSeconds(1);

        // Assert initial state
        job.Status.Should().Be(SimulationJobStatus.Queued);
        job.MatchesCompleted.Should().Be(0);

        // Act & Assert first completion
        job.MarkMatchCompleted(firstTimestamp);
        job.Status.Should().Be(SimulationJobStatus.Running);
        job.MatchesCompleted.Should().Be(1);
        job.StartedAt.Should().Be(firstTimestamp);
        job.LastUpdatedAt.Should().Be(firstTimestamp);
        job.CompletedAt.Should().BeNull();

        // Act & Assert second completion
        job.MarkMatchCompleted(secondTimestamp);
        job.Status.Should().Be(SimulationJobStatus.Completed);
        job.MatchesCompleted.Should().Be(2);
        job.CompletedAt.Should().Be(secondTimestamp);
        job.LastUpdatedAt.Should().Be(secondTimestamp);
    }
}
