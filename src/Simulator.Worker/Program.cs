using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Simulator.Worker.Messaging;
using Simulator.Worker.Options;
using Simulator.Worker.Simulation;
using Tournament.Application;
using Tournament.Application.Abstractions;
using Tournament.Infrastructure;
using Tournament.Infrastructure.Messaging.Options;

var builder = Host.CreateApplicationBuilder(args);

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
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Simulator.Worker")
    .WriteTo.Console()
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

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
builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.AddSingleton<ISimulationEngine, PoissonSimulationEngine>();
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<MatchSimulationWorker>();

var host = builder.Build();

try
{
	await host.RunAsync();
}
finally
{
	Log.CloseAndFlush();
}
