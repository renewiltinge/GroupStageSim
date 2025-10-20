using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Tournament.Api;

namespace Tournament.IntegrationTests;

public class BasicSmokeTests : IClassFixture<IntegrationTestContainers>
{
    private readonly IntegrationTestContainers _containers;

    public BasicSmokeTests(IntegrationTestContainers containers)
    {
        _containers = containers;
    }

    [Fact]
    public async Task Api_HealthEndpoint_ReturnsOk()
    {
        using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureAppConfiguration((ctx, cfg) => { /* Override if needed */ });
                builder.ConfigureServices(services =>
                {
                    // TODO: Inject test connection strings and broker options once DI surfaces them
                });
            });

        using var client = factory.CreateClient();
        var response = await client.GetAsync("/health");
        response.IsSuccessStatusCode.Should().BeTrue();
    }
}
