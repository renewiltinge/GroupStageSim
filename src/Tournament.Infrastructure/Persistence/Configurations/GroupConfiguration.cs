using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures persistence metadata for <see cref="GroupData"/>.
/// </summary>
public sealed class GroupConfiguration : IEntityTypeConfiguration<GroupData>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<GroupData> builder)
    {
        builder.ToTable("Groups");
        builder.HasKey(group => group.Id);

        builder.Property(group => group.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(group => group.CreatedAt)
            .IsRequired();

        builder.HasMany(group => group.Teams)
            .WithOne(team => team.Group)
            .HasForeignKey(team => team.GroupId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(group => group.Matches)
            .WithOne(match => match.Group)
            .HasForeignKey(match => match.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
