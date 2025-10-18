using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures persistence metadata for <see cref="TeamData"/>.
/// </summary>
public sealed class TeamConfiguration : IEntityTypeConfiguration<TeamData>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<TeamData> builder)
    {
        builder.ToTable("Teams");
        builder.HasKey(team => team.Id);

        builder.Property(team => team.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(team => team.Strength)
            .IsRequired();
    }
}
