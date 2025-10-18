using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tournament.Domain.Entities;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures persistence metadata for <see cref="MatchData"/>.
/// </summary>
public sealed class MatchConfiguration : IEntityTypeConfiguration<MatchData>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<MatchData> builder)
    {
        builder.ToTable("Matches");
        builder.HasKey(match => match.Id);

        builder.Property(match => match.Round)
            .IsRequired();

        builder.Property(match => match.ScheduledKickoff)
            .IsRequired();

        builder.Property(match => match.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(match => match.HomeScore);
        builder.Property(match => match.AwayScore);
    }
}
