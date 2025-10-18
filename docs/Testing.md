# File: docs/Testing.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Strategy Overview
- Aim for 85% line coverage in Domain/Application layers; 70% in Infrastructure.
- Prioritise deterministic tests using `<DEFAULT_SEED>` where randomness is involved.

## Unit Tests
- **Scheduler**: Validate round-robin output (6 matches, 3 rounds) and no duplicate pairings.
- **RankingService**: Cover two-team ties, three-team mini-table, GA ascending rule, fallback ordering.
- **SimulationEngine**: Assert higher strength produces higher win rate over 1,000 iterations; ensure lambda clamps.
- Use xUnit + FluentAssertions; substitute repositories with in-memory fakes.

## Integration Tests
- `Tournament.Api` + InMemory broker stub: ensure `/groups` -> event publish -> repository persistence works.
- Worker consuming from test queue: confirm `MatchPlayed` results applied to DB and re-queued on transient failures.
- EF Core migration test: apply migrations against Testcontainers `<DB_ENGINE>` and verify schema.

## Tooling
- `coverlet.collector` for coverage.
- `Testcontainers` packages for ephemeral `<DB_ENGINE>` and `<BROKER>`.
- Use `Respawn` to reset database between tests.

## Test Data & Seeds
- Default dataset: Group A with labelled teams `Alpha`, `Bravo`, `Charlie`, `Delta` and strengths 1.1/0.9/1.2/0.8.
- Random seeds: use `<DEFAULT_SEED>` plus iteration index for reproducible Monte Carlo runs.

## CI Considerations
- Parallelize unit tests; run integration tests sequentially to avoid port conflicts.
- Cache NuGet packages; ensure Docker or container runtime available for Testcontainers.

## Why This Matters
- Demonstrates holistic quality approach that balances deterministic logic with stochastic simulations.
- Highlights knowledge of modern .NET testing tooling (FluentAssertions, Testcontainers, coverlet).
- Provides interview-ready talking points about ensuring reliability in event-driven systems.
