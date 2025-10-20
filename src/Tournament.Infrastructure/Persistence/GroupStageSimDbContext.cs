using Microsoft.EntityFrameworkCore;
using Tournament.Infrastructure.Persistence.Models;

namespace Tournament.Infrastructure.Persistence;

/// <summary>
/// Primary EF Core DbContext for the tournament domain.
/// </summary>
public sealed class GroupStageSimDbContext : DbContext
{
    public GroupStageSimDbContext(DbContextOptions<GroupStageSimDbContext> options)
        : base(options)
    {
    }

    public DbSet<GroupData> Groups => Set<GroupData>();

    public DbSet<TeamData> Teams => Set<TeamData>();

    public DbSet<MatchData> Matches => Set<MatchData>();

    public DbSet<SimulationJobData> SimulationJobs => Set<SimulationJobData>();

    /// <summary>
    /// Configures persistence metadata for group entities.
    /// </summary>
    /// <param name="modelBuilder">Model builder instance.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GroupStageSimDbContext).Assembly);
    }
}
