using System;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Serilog;
using Tournament.Application;
using Tournament.Infrastructure;
using Tournament.Infrastructure.HealthChecks;
using Tournament.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "Tournament.Api")
        .WriteTo.Console());

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddRazorPages();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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

if (app.Environment.IsDevelopment())
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
