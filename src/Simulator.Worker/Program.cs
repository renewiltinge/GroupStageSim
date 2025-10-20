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

Log.Logger = new LoggerConfiguration()
	.ReadFrom.Configuration(builder.Configuration)
	.Enrich.FromLogContext()
	.WriteTo.Console()
	.CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

builder.Services.AddOptions();
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
