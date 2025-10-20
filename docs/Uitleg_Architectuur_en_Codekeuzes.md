# Architectuur en Codekeuzes GroupStageSim

*Uitgebreide uitleg van alle architecturale beslissingen en technische keuzes in het GroupStageSim project*

## Inhoudsopgave

1. [Projectoverzicht](#projectoverzicht)
2. [Architecturale Filosofie](#architecturale-filosofie)
3. [Clean Architecture Implementatie](#clean-architecture-implementatie)
4. [Domain-Driven Design Principes](#domain-driven-design-principes)
5. [Event-Driven Architecture](#event-driven-architecture)
6. [Data Persistentie Strategie](#data-persistentie-strategie)
7. [Monte Carlo Simulatie Engine](#monte-carlo-simulatie-engine)
8. [API Design en RESTful Principes](#api-design-en-restful-principes)
9. [Dependency Injection en IoC](#dependency-injection-en-ioc)
10. [Error Handling en Resilience](#error-handling-en-resilience)
11. [Testing Strategie](#testing-strategie)
12. [Deployment en Infrastructure](#deployment-en-infrastructure)
13. [SOLID Principes in de Praktijk](#solid-principes-in-de-praktijk)
14. [Code Quality en Maintainability](#code-quality-en-maintainability)

---

## Projectoverzicht

GroupStageSim is een .NET 8 applicatie die Monte Carlo simulaties uitvoert voor voetbaltoernooien in groepsfase. Het systeem modelleert het complete proces van groepsindeling, wedstrijdplanning, scoreverloop en eindstanden met deterministieke reproduceerbare resultaten.

### Kernfunctionaliteiten
- **Groepsbeheer**: Creëren van 4-teams groepen met unieke team profielen
- **Wedstrijdplanning**: Automatische round-robin schema generatie  
- **Monte Carlo Simulatie**: Poisson-gebaseerde score generatie met konfigureerbare iteraties
- **Real-time Resultaten**: Event-driven verwerking van wedstrijdresultaten
- **Ranking Systeem**: Complexe tie-breaker logica volgens officiële regels
- **API Interface**: RESTful endpoints voor alle operaties

---

## Architecturale Filosofie

### Separation of Concerns
Het project hanteert een strikte scheiding van verantwoordelijkheden door middel van **Clean Architecture**. Elke laag heeft een specifieke rol en afhankelijkheden vloeien alleen naar binnen toe.

### Expliciete Dependencies
Alle dependencies worden expliciet gedefinieerd via interfaces. Dit zorgt voor:
- **Testbaarheid**: Eenvoudig mocken van dependencies
- **Flexibiliteit**: Implementaties kunnen worden gewisseld zonder code wijzigingen
- **Loose Coupling**: Lagen zijn niet direct afhankelijk van concrete implementaties

### Single Responsibility Principle
Elke klasse heeft precies één reden om te veranderen. Dit wordt consistent toegepast van controllers tot domain entities.

---

## Clean Architecture Implementatie

### Laagstructuur

```
┌─────────────────────────────────────┐
│           Presentation              │
│     (Tournament.Api)                │
│  Controllers, Models, Mappers       │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│          Application                │
│    (Tournament.Application)         │
│   Services, Commands, Abstractions  │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│            Domain                   │
│      (Tournament.Domain)            │
│   Entities, Services, Business Logic│
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│         Infrastructure              │
│   (Tournament.Infrastructure)       │
│  Persistence, Messaging, External   │
└─────────────────────────────────────┘
```

### Domain Layer (Tournament.Domain)
De **Domain** laag bevat de kernbusiness logica en heeft geen dependencies op andere lagen.

#### Entities
```csharp
public sealed class Group
{
    public Guid Id { get; }
    public string Name { get; }
    public IReadOnlyCollection<Team> Teams { get; }
    public IReadOnlyCollection<Match> Matches { get; }
    
    // Encapsulatie van business rules
    private Group(Guid id, string name) { /* */ }
    
    // Factory method met validatie
    public static Group Create(string name, IReadOnlyCollection<Team> teams)
    {
        ValidateTeamCount(teams);
        ValidateUniqueTeams(teams);
        return new Group(Guid.NewGuid(), name);
    }
}
```

**Ontwerpkeuzes:**
- **Immutable entities**: State kan alleen wijzigen via gecontroleerde methods
- **Factory methods**: Constructor is private, creatie gaat via static methods
- **Value objects**: Encapsulatie van concepten zoals TeamStrength
- **Aggregate roots**: Group is de root voor Teams en Matches

#### Domain Services
```csharp
public sealed class Scheduler
{
    public IReadOnlyCollection<Match> CreateSchedule(Group group, DateTimeOffset firstKickoff)
    {
        // Round-robin algoritme implementatie
        // Geen dependencies, pure business logic
    }
}
```

### Application Layer (Tournament.Application)
De **Application** laag orchestreert use cases en bevat geen business logic.

#### Application Services
```csharp
public sealed class GroupService
{
    private const int BaselineSecondsPerIteration = 2;
    
    private readonly IGroupRepository repository;
    private readonly IMessageBus messageBus;
    private readonly IRankingService rankingService;
    
    public async Task<Guid> TriggerSimulationAsync(Guid groupId, int iterations, CancellationToken cancellationToken)
    {
        // Use case orchestratie
        // Geen business logic, alleen coördinatie
    }
}
```

**Ontwerpkeuzes:**
- **Command objects**: Expliciete input parameters via command pattern
- **Return DTOs**: Application services retourneren data transfer objects
- **Async all the way**: Consequent async/await pattern
- **Cancellation support**: Alle async methods ondersteunen cancellation

### Infrastructure Layer (Tournament.Infrastructure)
De **Infrastructure** laag implementeert interfaces uit Application laag.

#### Repository Pattern
```csharp
public sealed class GroupRepository : IGroupRepository
{
    private readonly GroupStageSimDbContext context;
    private readonly IMapper<GroupData, Group> mapper;
    
    public async Task<Group?> GetAsync(Guid id, bool includeMatches = false, CancellationToken cancellationToken = default)
    {
        // EF Core query implementatie
        // Mapping tussen persistence en domain models
    }
}
```

#### Event-Driven Messaging
```csharp
public sealed class RabbitMqMessageBus : IMessageBus
{
    public async Task PublishAsync<T>(T message, CancellationToken cancellationToken)
    {
        // RabbitMQ publicatie logica
        // Routing key generatie
        // Serialization naar JSON
    }
}
```

---

## Domain-Driven Design Principes

### Ubiquitous Language
Het project hanteert consequent een uniforme terminologie:

- **Group**: Groep van 4 teams in toernooi context
- **Match**: Individuele wedstrijd tussen twee teams  
- **Team**: Participant met naam en strength rating
- **Simulation**: Monte Carlo iteratie proces
- **Standings**: Gerankte team lijst op basis van punten

### Bounded Context
Het systeem heeft één duidelijke bounded context: **Tournament Management**. Alle concepten draaien rond het organiseren en simuleren van groepsfase toernooien.

### Aggregate Design
**Group** fungeert als aggregate root:
- **Consistency boundary**: Alle wijzigingen aan Teams en Matches gaan via Group
- **Transactional boundary**: Een Group wordt altijd atomair gewijzigd
- **Identity**: Group heeft Guid als natuurlijke identifier

### Domain Events
Hoewel niet expliciet geïmplementeerd als domain events, worden business gebeurtenissen via messaging afgehandeld:
- `MatchScheduled`: Wedstrijd is gepland voor simulatie
- `MatchPlayed`: Simulatie resultaat is beschikbaar

---

## Event-Driven Architecture

### Message Patterns
Het systeem gebruikt **Request-Response** en **Publish-Subscribe** patterns:

#### Asynchrone Verwerking
```csharp
// 1. API publiceert MatchScheduled event
await messageBus.PublishAsync(new MatchScheduled(/* parameters */), cancellationToken);

// 2. Simulator Worker consumeert event
public async Task OnMessageAsync(object sender, BasicDeliverEventArgs eventArgs)
{
    var scheduled = Deserialize(eventArgs.Body.Span);
    await ProcessMessageAsync(scheduled, eventArgs.DeliveryTag);
}

// 3. Worker publiceert MatchPlayed event
await messageBus.PublishAsync(new MatchPlayed(/* results */), cancellationToken);
```

### Message Contracts
Expliciete contracts voor inter-service communicatie:

```csharp
namespace GroupStageSim.Contracts;

public sealed record MatchScheduled(
    Guid MatchId,
    Guid GroupId, 
    Guid HomeTeamId,
    Guid AwayTeamId,
    int Iterations,
    Guid CorrelationId);
```

**Ontwerpkeuzes:**
- **Records**: Immutable data structures voor messages
- **Correlation IDs**: Traceability tussen gerelateerde events
- **Explicit schemas**: Geen implicit coupling tussen services

### RabbitMQ Implementatie
```csharp
// Exchange configuratie
channel.ExchangeDeclare(exchangeName, ExchangeType.Topic, durable: true);

// Queue binding met routing keys  
channel.QueueBind(queueName, exchangeName, routingKey: "match.scheduled");

// Durable messages voor persistence
var properties = channel.CreateBasicProperties();
properties.Persistent = true;
```

---

## Data Persistentie Strategie

### Entity Framework Core
EF Core wordt gebruikt voor data persistentie met **Code First** migrations.

#### DbContext Design
```csharp
public sealed class GroupStageSimDbContext : DbContext
{
    public DbSet<GroupData> Groups => Set<GroupData>();
    public DbSet<TeamData> Teams => Set<TeamData>();
    public DbSet<MatchData> Matches => Set<MatchData>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GroupStageSimDbContext).Assembly);
    }
}
```

#### Data Models vs Domain Models
Het project hanteert **separate data models** voor persistentie:

```csharp
// Domain model
public sealed class Group
{
    public Guid Id { get; }
    public string Name { get; }
    // Rich domain behavior
}

// Data model  
public sealed class GroupData
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    // Persistence-specific properties
}
```

**Voordelen van deze scheiding:**
- **Domain isolation**: Persistence concerns leiden niet domain design
- **Migration flexibility**: Data model kan evolueren onafhankelijk
- **Query optimization**: Data models geoptimaliseerd voor database operaties

#### Mapping Strategy
AutoMapper wordt gebruikt voor object-to-object mapping:

```csharp
public sealed class GroupMappingProfile : Profile
{
    public GroupMappingProfile()
    {
        CreateMap<GroupData, Group>()
            .ConstructUsing(src => Group.Create(src.Name, /* teams */));
            
        CreateMap<Group, GroupData>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id));
    }
}
```

---

## Monte Carlo Simulatie Engine

### Poisson Distributie Model
De kern van het systeem is een **Poisson-gebaseerd** simulatie algoritme:

```csharp
public sealed class PoissonSimulationEngine : ISimulationEngine
{
    public Task<(int HomeScore, int AwayScore)> SimulateAsync(Match match, Team homeTeam, Team awayTeam, int iteration, CancellationToken cancellationToken)
    {
        // Strength ratio berekening
        var ratio = ClampStrength(homeTeam.Strength / awayTeam.Strength);
        
        // Lambda parameters voor Poisson distributie
        var lambdaHome = options.BaseRate * ratio * options.HomeAdvantage;
        var lambdaAway = options.BaseRate * ratioOpp * options.AwayModifier;
        
        // Deterministieke random number generation
        var rng = CreateRandom(match.Id, iteration);
        
        // Knuth algoritme voor Poisson sampling
        var homeGoals = SamplePoisson(lambdaHome, rng);
        var awayGoals = SamplePoisson(lambdaAway, rng);
        
        return Task.FromResult((homeGoals, awayGoals));
    }
}
```

### Deterministieke Reproduceerbaarheid
Cruciale eigenschap voor testing en debugging:

```csharp
private Random CreateRandom(Guid matchId, int iteration)
{
    var seed = CreateSeed(matchId, iteration);
    return new Random(seed);
}

private int CreateSeed(Guid matchId, int iteration)
{
    var normalizedIteration = iteration <= 0 ? 1 : iteration;
    var hash = HashCode.Combine(options.DefaultSeed, matchId, normalizedIteration);
    return hash & int.MaxValue;
}
```

**Ontwerpkeuzes:**
- **Deterministic seeding**: Zelfde input geeft altijd zelfde output
- **Match-specific seeds**: Elke wedstrijd heeft unieke maar reproduceerbare seeds
- **Iteration awareness**: Verschillende iteraties van dezelfde wedstrijd variëren

### Configureerbare Parameters
```csharp
public sealed class SimulationOptions
{
    public double BaseRate { get; set; } = 1.3;
    public double HomeAdvantage { get; set; } = 1.1;
    public double AwayModifier { get; set; } = 0.9;
    public int MaxGoals { get; set; } = 10;
    public int DefaultSeed { get; set; } = 12345;
}
```

---

## API Design en RESTful Principes

### Resource-Oriented Design
De API volgt RESTful principes met duidelijke resource hiërarchie:

```
POST   /groups                     # Create group
GET    /groups/{id}/matches        # Get group matches  
GET    /groups/{id}/standings      # Get current standings
POST   /groups/{id}/simulate       # Trigger simulation
GET    /groups/{id}/simulation-status # Check simulation progress
POST   /groups/{id}/reset          # Reset group state
```

### HTTP Status Codes
Consequent gebruik van semantisch correcte status codes:

```csharp
[HttpPost]
[ProducesResponseType(typeof(GroupResponse), StatusCodes.Status201Created)]
public async Task<IActionResult> CreateGroupAsync([FromBody] CreateGroupRequest request, CancellationToken cancellationToken)
{
    var group = await groupService.CreateGroupAsync(command, cancellationToken);
    return CreatedAtRoute("GetGroupMatches", new { id = group.Id }, response);
}

[HttpPost("{id:guid}/simulate")]  
[ProducesResponseType(typeof(SimulationQueuedResponse), StatusCodes.Status202Accepted)]
public async Task<IActionResult> SimulateAsync(Guid id, [FromQuery] int iterations, CancellationToken cancellationToken)
{
    var correlationId = await groupService.TriggerSimulationAsync(id, iterations, cancellationToken);
    return Accepted(response); // 202 voor asynchrone verwerking
}
```

### Request/Response Models
Expliciete models voor API contracts:

```csharp
public sealed class CreateGroupRequest
{
    public string Name { get; set; } = string.Empty;
    public List<CreateTeamRequest> Teams { get; set; } = new();
}

public sealed class GroupResponse  
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<TeamResponse> Teams { get; set; } = new();
    public List<MatchResponse> Matches { get; set; } = new();
    public Guid CorrelationId { get; set; }
}
```

### Error Handling
Gestandaardiseerde error responses via ProblemDetails:

```csharp
private static ProblemDetails CreateProblem(string detail, Guid groupId)
{
    return new ProblemDetails
    {
        Title = "Group not found",
        Detail = detail,
        Status = StatusCodes.Status404NotFound,
        Type = "https://httpstatuses.com/404",
        Instance = $"/groups/{groupId}"
    };
}
```

---

## Dependency Injection en IoC

### Service Registration
Elke laag registreert zijn services via extension methods:

```csharp
// Tournament.Application
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<GroupService>();
        services.AddScoped<IRankingService, RankingService>();
        services.AddAutoMapper(typeof(DependencyInjection));
        return services;
    }
}

// Tournament.Infrastructure  
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<GroupStageSimDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));
            
        services.AddScoped<IGroupRepository, GroupRepository>();
        services.AddScoped<IMessageBus, RabbitMqMessageBus>();
        
        return services;
    }
}
```

### Lifetime Management
Zorgvuldige keuze van service lifetimes:

- **Scoped**: Repositories, DbContext, Application Services
- **Singleton**: Configuration options, ILogger  
- **Transient**: Message handlers, mappers

### Constructor Injection
Consequent gebruik van constructor injection:

```csharp
public sealed class GroupService
{
    private readonly IGroupRepository repository;
    private readonly IMessageBus messageBus;
    private readonly IRankingService rankingService;
    
    public GroupService(IGroupRepository repository, IMessageBus messageBus, IRankingService rankingService)
    {
        this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
        this.messageBus = messageBus ?? throw new ArgumentNullException(nameof(messageBus));
        this.rankingService = rankingService ?? throw new ArgumentNullException(nameof(rankingService));
    }
}
```

---

## Error Handling en Resilience

### Exception Strategy
Het project hanteert een gelaagde exception strategie:

#### Domain Exceptions
```csharp
public sealed class InvalidTeamCountException : Exception
{
    public InvalidTeamCountException(int actualCount) 
        : base($"Group requires exactly 4 teams, but {actualCount} were provided")
    {
        ActualCount = actualCount;
    }
    
    public int ActualCount { get; }
}
```

#### Application Exceptions
```csharp
public sealed class GroupNotFoundException : Exception
{
    public GroupNotFoundException(Guid groupId) 
        : base($"Group with ID {groupId} was not found")
    {
        GroupId = groupId;
    }
    
    public Guid GroupId { get; }
}
```

### API Error Mapping
Controllers vangen specifieke exceptions en mappen naar HTTP responses:

```csharp
[HttpGet("{id:guid}/standings")]
public async Task<IActionResult> GetStandingsAsync(Guid id, CancellationToken cancellationToken)
{
    try
    {
        var standings = await groupService.GetStandingsAsync(id, cancellationToken);
        return Ok(response);
    }
    catch (GroupNotFoundException ex)
    {
        return NotFound(CreateProblem(ex.Message, ex.GroupId));
    }
}
```

### Message Processing Resilience
RabbitMQ message verwerking heeft retry mechanisme:

```csharp
private const int MaxRetryAttempts = 3;

private async Task OnMessageAsync(object sender, BasicDeliverEventArgs eventArgs)
{
    var attempts = 0;
    while (!shutdownToken.IsCancellationRequested)
    {
        try
        {
            await ProcessMessageAsync(scheduled, eventArgs.DeliveryTag);
            break;
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            attempts++;
            var shouldRequeue = attempts < MaxRetryAttempts && !eventArgs.Redelivered;
            
            if (!shouldRequeue)
            {
                channel!.BasicNack(eventArgs.DeliveryTag, multiple: false, requeue: false);
                return;
            }
            
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempts)), shutdownToken);
        }
    }
}
```

---

## Testing Strategie

### Unit Testing Structure
Het project bevat test projecten voor elke laag:

```
tests/
├── Tournament.Application.Tests/
├── Tournament.Domain.Tests/  
├── Tournament.Infrastructure.Tests/
└── Simulator.Worker.Tests/
```

### Test Categorieën

#### Domain Logic Tests
```csharp
[Test]
public void CreateGroup_WithValidTeams_ShouldCreateGroup()
{
    // Arrange
    var teams = CreateValidTeams();
    
    // Act  
    var group = Group.Create("Test Group", teams);
    
    // Assert
    Assert.That(group.Teams, Has.Count.EqualTo(4));
    Assert.That(group.Name, Is.EqualTo("Test Group"));
}
```

#### Application Service Tests
```csharp
[Test]
public async Task TriggerSimulationAsync_WithExistingGroup_ShouldPublishEvents()
{
    // Arrange
    var mockRepository = new Mock<IGroupRepository>();
    var mockMessageBus = new Mock<IMessageBus>();
    var service = new GroupService(mockRepository.Object, mockMessageBus.Object);
    
    // Act
    await service.TriggerSimulationAsync(groupId, iterations, CancellationToken.None);
    
    // Assert
    mockMessageBus.Verify(x => x.PublishAsync(It.IsAny<MatchScheduled>(), It.IsAny<CancellationToken>()), Times.AtLeast(6));
}
```

#### Integration Tests
```csharp
[Test]
public async Task SimulationWorkflow_EndToEnd_ShouldUpdateStandings()
{
    // Arrange - setup test database, message bus
    
    // Act - trigger complete simulation workflow
    
    // Assert - verify final standings are correct
}
```

---

## Deployment en Infrastructure

### Docker Compose Setup
Het systeem wordt gedeployed via Docker Compose:

```yaml
version: '3.8'
services:
  tournament-api:
    build: 
      context: .
      dockerfile: src/Tournament.Api/Dockerfile
    ports:
      - "5000:80"
    depends_on:
      - sqlserver
      - rabbitmq
      
  simulator-worker:
    build:
      context: .  
      dockerfile: src/Simulator.Worker/Dockerfile
    depends_on:
      - sqlserver
      - rabbitmq
      
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: Y
      SA_PASSWORD: YourPassword123!
      
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672" # Management UI
      - "5672:5672"   # AMQP
```

### Configuration Management
Environment-specific configuratie via appsettings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sqlserver;Database=GroupStageSimDb;User Id=sa;Password=YourPassword123!;TrustServerCertificate=true"
  },
  "RabbitMQ": {
    "Host": "rabbitmq",
    "Port": 5672,
    "ExchangeName": "groupstagesim"
  },
  "Simulation": {
    "BaseRate": 1.3,
    "HomeAdvantage": 1.1
  }
}
```

### Health Checks
Implementatie van health checks voor monitoring:

```csharp
public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly GroupStageSimDbContext context;
    
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken)
    {
        try
        {
            await this.context.Database.CanConnectAsync(cancellationToken);
            return HealthCheckResult.Healthy("Database connection successful");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database connection failed", ex);
        }
    }
}
```

---

## SOLID Principes in de Praktijk

### Single Responsibility Principle (SRP)
Elke klasse heeft precies één verantwoordelijkheid:

```csharp
// ✅ Enkelvoudige verantwoordelijkheid: wedstrijd planning
public sealed class Scheduler
{
    public IReadOnlyCollection<Match> CreateSchedule(Group group, DateTimeOffset firstKickoff)
    {
        // Alleen planning logica
    }
}

// ✅ Enkelvoudige verantwoordelijkheid: ranglijst berekening  
public sealed class RankingService : IRankingService
{
    public IReadOnlyCollection<TeamStanding> CalculateStandings(Group group)
    {
        // Alleen ranking logica
    }
}
```

### Open/Closed Principle (OCP)
Systeem is open voor uitbreiding, gesloten voor modificatie:

```csharp
// Interface definieert contract
public interface ISimulationEngine
{
    Task<(int HomeScore, int AwayScore)> SimulateAsync(/* parameters */);
}

// Verschillende implementaties mogelijk zonder core wijzigingen
public sealed class PoissonSimulationEngine : ISimulationEngine { }
public sealed class BinomialSimulationEngine : ISimulationEngine { } // Toekomstige uitbreiding
```

### Liskov Substitution Principle (LSP)
Alle implementaties zijn verwisselbaar zonder gedragswijziging:

```csharp
// IMessageBus implementaties zijn volledig substitueerbaar
public sealed class RabbitMqMessageBus : IMessageBus { }
public sealed class InMemoryMessageBus : IMessageBus { } // Test implementatie
public sealed class AzureServiceBusMessageBus : IMessageBus { } // Cloud implementatie
```

### Interface Segregation Principle (ISP)
Interfaces zijn specifiek en gefocust:

```csharp
// ✅ Specifieke interface voor repository operaties
public interface IGroupRepository
{
    Task<Group?> GetAsync(Guid id, bool includeMatches = false, CancellationToken cancellationToken = default);
    Task SaveAsync(Group group, CancellationToken cancellationToken = default);
}

// ✅ Specifieke interface voor messaging
public interface IMessageBus  
{
    Task PublishAsync<T>(T message, CancellationToken cancellationToken);
}
```

### Dependency Inversion Principle (DIP)
High-level modules zijn niet afhankelijk van low-level details:

```csharp
// ✅ GroupService (high-level) hangt af van abstractions (IGroupRepository)
public sealed class GroupService
{
    private readonly IGroupRepository repository; // Abstractie, niet concrete implementatie
    private readonly IMessageBus messageBus;     // Abstractie, niet concrete implementatie
}

// ✅ Infrastructure implementeert domain abstractions  
public sealed class GroupRepository : IGroupRepository // Domain interface
{
    private readonly GroupStageSimDbContext context; // Infrastructure detail
}
```

---

## Code Quality en Maintainability

### Naming Conventions
Consistente en beschrijvende naamgeving door heel het project:

```csharp
// ✅ Duidelijke class namen
public sealed class PoissonSimulationEngine : ISimulationEngine
public sealed class MatchSimulationWorker : BackgroundService
public sealed class GroupStageSimDbContext : DbContext

// ✅ Beschrijvende method namen
public async Task<Guid> TriggerSimulationAsync(Guid groupId, int iterations, CancellationToken cancellationToken)
public IReadOnlyCollection<TeamStanding> CalculateStandings(Group group)

// ✅ Duidelijke parameter namen
public static Group Create(string name, IReadOnlyCollection<Team> teams)
public Task<(int HomeScore, int AwayScore)> SimulateAsync(Match match, Team homeTeam, Team awayTeam, int iteration, CancellationToken cancellationToken)
```

### Constants vs Magic Numbers
Alle magic numbers zijn vervangen door named constants:

```csharp
public sealed class RankingService : IRankingService
{
    private const int PointsPerWin = 3;
    private const int PointsPerDraw = 1;
    
    private int CalculatePoints(int wins, int draws)
    {
        return wins * PointsPerWin + draws * PointsPerDraw; // ✅ Duidelijk ipv wins * 3 + draws
    }
}

public sealed class MatchSimulationWorker : BackgroundService  
{
    private const int MaxRetryAttempts = 3; // ✅ Duidelijk ipv attempts < 3
}
```

### Modern C# Features
Gebruik van moderne C# syntax voor verbeterde leesbaarheid:

```csharp
// ✅ Pattern matching voor validatie
public Team(Guid id, string name, int strength)
{
    if (strength is <= 0 or > 5)
        throw new ArgumentOutOfRangeException(nameof(strength));
}

// ✅ Records voor immutable data
public sealed record MatchScheduled(Guid MatchId, Guid GroupId, Guid HomeTeamId, Guid AwayTeamId, int Iterations, Guid CorrelationId);

// ✅ Null-conditional operators
var match = group.Matches.SingleOrDefault(m => m.Id == matchId);
if (match is null) return;

// ✅ String interpolation
logger.LogInformation("Created group {GroupId} with correlationId {CorrelationId}", group.Id, correlationId);
```

### Documentation Standards
Consistent gebruik van XML documentation:

```csharp
/// <summary>
/// Generates round-robin schedules for a four-team group.
/// </summary>
public sealed class Scheduler
{
    /// <summary>
    /// Builds a three-round schedule that produces six unique fixtures.
    /// </summary>
    /// <param name="group">The target group.</param>
    /// <param name="firstKickoff">Timestamp for the initial fixture.</param>
    /// <returns>A collection of scheduled matches.</returns>
    public IReadOnlyCollection<Match> CreateSchedule(Group group, DateTimeOffset firstKickoff)
```

### Immutability Patterns
Voorkeur voor immutable data structures waar mogelijk:

```csharp
// ✅ Immutable entities
public sealed class Group
{
    public Guid Id { get; } // Readonly property
    public string Name { get; } // Readonly property
    public IReadOnlyCollection<Team> Teams { get; } // Readonly collection
    
    private Group(Guid id, string name) { } // Private constructor
    public static Group Create(string name, IReadOnlyCollection<Team> teams) { } // Factory method
}

// ✅ Immutable messages
public sealed record MatchScheduled(/* immutable parameters */);
```

---

## Conclusie

Het GroupStageSim project demonstreert een robuuste implementatie van moderne .NET architectuur principes. Door consequente toepassing van Clean Architecture, Domain-Driven Design, en SOLID principes is een maintainbaar, testbaar en uitbreidbaar systeem ontstaan.

### Sterke Punten
- **Duidelijke scheiding van verantwoordelijkheden** via gelaagde architectuur
- **Expliciete dependencies** via dependency injection
- **Event-driven design** voor loose coupling tussen componenten  
- **Deterministieke simulaties** voor reproduceerbare resultaten
- **Comprehensive error handling** op alle lagen
- **Modern C# features** voor verbeterde code kwaliteit

### Architecturale Voordelen
- **Testbaarheid**: Alle dependencies zijn mockbaar
- **Flexibiliteit**: Implementaties kunnen worden gewisseld
- **Schaalbaarheid**: Event-driven design ondersteunt horizontal scaling
- **Maintainability**: Clear separation of concerns vereenvoudigt wijzigingen
- **Extensibility**: Open/Closed principle maakt uitbreidingen mogelijk

Het project toont aan hoe complexe business requirements (Monte Carlo simulaties, tie-breaker regels, real-time processing) kunnen worden gemodelleerd in een clean, maintainbare codebase die professional development best practices volgt.