using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures persistence metadata for <see cref="SimulationJobData"/>.
/// </summary>
public sealed class SimulationJobDataConfiguration : IEntityTypeConfiguration<SimulationJobData>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<SimulationJobData> builder)
    {
        builder.ToTable("SimulationJobs");

        builder.HasKey(job => job.Id);

        builder.Property(job => job.CorrelationId)
            .IsRequired();

        builder.HasIndex(job => job.CorrelationId)
            .IsUnique();

        builder.Property(job => job.Iterations)
            .IsRequired();

        builder.Property(job => job.MatchesTotal)
            .IsRequired();

        builder.Property(job => job.MatchesCompleted)
            .IsRequired();

        builder.Property(job => job.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(job => job.QueuedAt)
            .IsRequired();

        builder.Property(job => job.LastUpdatedAt)
            .IsRequired();

        builder.Property(job => job.RowVersion)
            .IsRowVersion();
    }
}
