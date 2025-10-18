using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tournament.Application.Abstractions;
using Tournament.Infrastructure.Messaging;
using Tournament.Infrastructure.Messaging.Options;
using Tournament.Infrastructure.Persistence;
using Tournament.Infrastructure.Repositories;

namespace Tournament.Infrastructure;

/// <summary>
/// Provides dependency-injection helpers for infrastructure services.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers infrastructure components required by the application.
    /// </summary>
    /// <param name="services">Service collection.</param>
    /// <param name="configuration">Configuration root.</param>
    /// <returns>Service collection for chaining.</returns>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<RabbitMqOptions>(configuration.GetSection("RabbitMq"));

        services.AddDbContext<GroupStageSimDbContext>((sp, options) =>
        {
            var connectionString = configuration.GetConnectionString("Default")
                ?? throw new InvalidOperationException("Connection string 'Default' was not found.");
            options.UseSqlServer(connectionString, sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName));
        });

        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddSingleton<IMessageBus, RabbitMqMessageBus>();

        return services;
    }
}
