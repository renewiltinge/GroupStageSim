using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using DotNet.Testcontainers.Configurations;

namespace Tournament.IntegrationTests;

public sealed class IntegrationTestContainers : IAsyncLifetime
{
    private readonly TestcontainersContainer _sql;
    private readonly TestcontainersContainer _rabbit;

    public string ConnectionString => $"Server=localhost,{_sql.GetMappedPublicPort(1433)};Database=groupstage;User Id=sa;Password=Your_password123;TrustServerCertificate=True";
    public string RabbitMqHost => "localhost";
    public int RabbitMqPort => _rabbit.GetMappedPublicPort(5672);

    public IntegrationTestContainers()
    {
        _sql = new TestcontainersBuilder<TestcontainersContainer>()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .WithEnvironment("ACCEPT_EULA", "Y")
            .WithEnvironment("MSSQL_SA_PASSWORD", "Your_password123")
            .WithPortBinding(0, 1433)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(1433))
            .Build();

        _rabbit = new TestcontainersBuilder<TestcontainersContainer>()
            .WithImage("rabbitmq:3-management")
            .WithPortBinding(0, 5672)
            .WithPortBinding(0, 15672)
            .WithWaitStrategy(Wait.ForUnixContainer().UntilPortIsAvailable(5672))
            .Build();
    }

    public async Task InitializeAsync()
    {
        await _sql.StartAsync();
        await _rabbit.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _sql.DisposeAsync();
        await _rabbit.DisposeAsync();
    }
}
