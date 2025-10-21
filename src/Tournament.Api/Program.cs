using System;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Serilog;
using Tournament.Application;
using Tournament.Infrastructure;
using Tournament.Infrastructure.HealthChecks;
using Tournament.Infrastructure.Options;
using Tournament.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Configuration precedence: environment variables > appsettings.{Environment}.json > appsettings.json
var env = builder.Environment;
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Validate configuration early
var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrEmpty(connectionString) || connectionString.Contains("(configure via env)"))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. " +
        "Set ConnectionStrings__Default environment variable or update appsettings files.");
}

// Configure Serilog
builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Tournament.Api")
        .WriteTo.Console());

// Configure Options with validation
builder.Services.Configure<BrokerOptions>(builder.Configuration.GetSection("Broker"));
builder.Services.PostConfigure<BrokerOptions>(options =>
{
    if (env.IsDevelopment() || env.EnvironmentName.Equals("Docker", StringComparison.OrdinalIgnoreCase))
    {
        if (string.IsNullOrWhiteSpace(options.HostName) || options.HostName.Contains("(configure via env)"))
            throw new InvalidOperationException("Broker:HostName is not configured.");
        if (options.Port <= 0)
            throw new InvalidOperationException("Broker:Port must be greater than 0.");
        if (string.IsNullOrWhiteSpace(options.UserName) || options.UserName.Contains("(configure via env)"))
            throw new InvalidOperationException("Broker:UserName is not configured.");
        if (string.IsNullOrWhiteSpace(options.Password) || options.Password.Contains("(configure via env)"))
            throw new InvalidOperationException("Broker:Password is not configured.");
    }
});

builder.Services.Configure<SimulationOptions>(builder.Configuration.GetSection("Simulation"));
builder.Services.Configure<Tournament.Api.Options.ApiSettings>(builder.Configuration.GetSection("ApiSettings"));

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Tournament API", Version = "v1" });
    c.DocInclusionPredicate((name, api) =>
    {
        // Exclude minimal APIs and health checks from Swagger
        return !api.RelativePath?.StartsWith("health") == true &&
               !api.RelativePath?.StartsWith("healthz") == true &&
               api.RelativePath != "";
    });
});
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<GroupStageSimDbContext>("database")
    .AddCheck<RabbitMqHealthCheck>("rabbitmq");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var environment = scope.ServiceProvider.GetRequiredService<IHostEnvironment>();
    if (environment.IsDevelopment() || string.Equals(environment.EnvironmentName, "Docker", StringComparison.OrdinalIgnoreCase))
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<GroupStageSimDbContext>();
        dbContext.Database.Migrate();
    }
}

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || string.Equals(app.Environment.EnvironmentName, "Docker", StringComparison.OrdinalIgnoreCase))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.MapControllers();
app.MapRazorPages();

app.MapGet("/", () => Results.Redirect("/ui", permanent: false));

var liveHealthOptions = new HealthCheckOptions
{
    Predicate = _ => false
};

var readinessOptions = new HealthCheckOptions();

app.MapHealthChecks("/health/live", liveHealthOptions);
app.MapHealthChecks("/healthz", liveHealthOptions);
app.MapHealthChecks("/health/ready", readinessOptions);
app.MapHealthChecks("/healthz/ready", readinessOptions);

app.Run();
