# File: docs/AspNetGuidelines.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Project Layout
- **Domain**: Entities (`Team`, `Match`, `Group`, `StandingRow`) and pure services (`RankingService`). No framework references.
- **Application**: Use cases, abstraction interfaces (`IMatchRepository`, `IMessageBus`), DTO mapping.
- **Infrastructure**: EF Core DbContext, repositories, RabbitMQ bus implementations, Serilog configuration.
- **Api**: ASP.NET Core Web API project with controllers, composition root, Swagger, filters.

### Why This Matters
- Enforces clean boundaries so business rules remain testable and independent of infrastructure churn.

## Controllers over Minimal APIs
- Stick with attribute-routed controllers for discoverability, filters, and easier model binding customisation.
- Use `ApiController` attribute, action result types, and problem details responses.

### Why This Matters
- Controllers align with Clean Architecture by keeping presentation logic structured and extendable.

## DTOs vs Domain Models
- Expose DTO records tailored for API contracts; keep domain entities internal to Domain/Application layers.
- Use mapping profiles (e.g., Mapster, custom mappers) to translate between domain and DTOs.
- Preserve immutability by projecting to read-only DTOs.

### Why This Matters
- Shields clients from domain refactors and prevents over-posting or validation bypasses.

## Validation & Problem Details
- Apply FluentValidation for request DTO rules; integrate with `ValidationProblemDetails`.
- Register a global exception middleware that converts unhandled exceptions into RFC 7807 payloads.
- Include validation codes and `CorrelationId` in extensions.

### Why This Matters
- Provides consistent client feedback and auditability for support scenarios.

## Dependency Injection Conventions
- Register services with lifetimes matching usage: domain services as scoped, message bus as singleton wrapper with internally managed channels, repositories as scoped.
- Inject `CancellationToken` into async methods, pass through to EF Core and RabbitMQ operations.
- Avoid static helpers; prefer extension methods on `IServiceCollection` for wiring.

### Why This Matters
- Encourages testability, resource safety, and aligns with async best practices.

## EF Core Practices
- Configure `GroupStageSimDbContext` as scoped; disable lazy loading, use explicit includes.
- Normalize schema with owned types where helpful (`StandingRow` snapshot).
- Apply migrations on startup in controlled environments; separate CLI command for production.
- Wrap multi-write operations in `IDbContextTransaction`; leverage optimistic concurrency tokens.

### Why This Matters
- Prevents hidden data access pitfalls and ensures reliable persistence under load.

## Logging with Serilog
- Configure Serilog in `Program.cs` with JSON sinks (console, file or Seq optional).
- Enrich with `CorrelationId`, request path, and user agent.
- Use structured events for scheduling, simulation triggers, and repository state changes.

### Why This Matters
- Structured logs power observability, enabling faster incident triage during demos.

## Health Checks & Readiness
- Map `/health/live` for process liveness and `/health/ready` for dependencies (database, broker).
- Use tags to include/exclude checks from readiness.

### Why This Matters
- Supports container orchestrators, enabling rolling updates without serving bad traffic.

## OpenAPI & Versioning
- Add Swashbuckle with XML comments, example providers, and JWT (future) placeholders.
- Version controllers via URL or media type; default to single `v1` route group, prepare for expansion.

### Why This Matters
- Produces self-documenting APIs, easing client integration and interview walkthroughs.

## Testing Layers
- Domain unit tests for scheduling, ranking, simulation math.
- Application tests with in-memory fakes for repositories, message bus.
- API integration tests using `WebApplicationFactory`, verifying ProblemDetails and event publishing stubs.

### Why This Matters
- Reinforces defence-in-depth quality strategy and highlights ability to test complex flows.

## EditorConfig & Analyzers
- Enable `.editorconfig` with consistent formatting, nullable context enforced.
- Add `Microsoft.CodeAnalysis.NetAnalyzers` and `StyleCop.Analyzers` for warning-level enforcement.

### Why This Matters
- Keeps contributions aligned with team standards and avoids nitpicky PR feedback.
