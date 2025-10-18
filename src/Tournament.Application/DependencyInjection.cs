using Microsoft.Extensions.DependencyInjection;
using Tournament.Application.Services;
using Tournament.Domain.Services;

namespace Tournament.Application;

/// <summary>
/// Provides dependency-injection helpers for the application layer.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers application services and domain orchestration components.
    /// </summary>
    /// <param name="services">Service collection.</param>
    /// <returns>Service collection for chaining.</returns>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<GroupService>();
        services.AddSingleton<Scheduler>();
        services.AddSingleton<RankingService>();
        services.AddSingleton<MatchResultApplier>();
        return services;
    }
}
