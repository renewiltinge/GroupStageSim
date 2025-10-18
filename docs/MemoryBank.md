# File: docs/MemoryBank.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Elevator Pitch
- <PROJECT_NAME> is a backend-first, event-driven mini-simulator that schedules, simulates, and ranks a four-team group stage using ASP.NET Core, EF Core, and worker-based Monte Carlo iterations.

## Core Invariants & Acceptance Criteria
- Every tournament group contains exactly four teams and produces six matches over three round-robin matchdays.
- Standings sorting order is Points (desc), Goal Difference (desc), Goals For (desc), Goals Against (asc), then Head-to-Head mini-table metrics.
- Match lifecycle flows from scheduling to simulation and result application without skipping states; each event carries a `CorrelationId` for traceability.
- API must expose hydration endpoints for groups, matches, and standings and accept idempotent create/simulate requests.

## Domain Glossary
- **Group**: Aggregate of four `Team` entities, round-robin schedule, and standings state.
- **Team**: Immutable identity paired with strength ratings and metadata required for simulation.
- **Match**: Scheduled fixture between two teams with assigned round, simulation inputs, and actual/expected scores.
- **StandingRow**: Aggregated metrics (Points, GD, GF, GA, wins, draws, losses) per team within a group.

## Simulation Defaults
- Base scoring rate `<BASE_RATE>` controls neutral-venue goal expectation.
- Home and away modifiers `<HOME_ADV>`, `<AWAY_MOD>` skew Poisson parameters for venue bias.
- Default random seed `<DEFAULT_SEED>` ensures reproducible Monte Carlo runs unless overridden.

## Tie-Breaker Stack
- Evaluate standings using Points, GD, GF, GA, and Head-to-Head mini-table in that order.
- For three-team circular ties, construct a mini-table from mutual results, reapply the primary ordering, and only then revert to overall metrics.

## API Surface Summary
- `POST /groups`: Create a group with four teams and strength ratings.
- `POST /groups/{id}/simulate?iterations=N`: Trigger Monte Carlo simulations; default iterations determined by application config.
- `GET /groups/{id}/standings`: Retrieve sorted standings rows with audit metadata.
- `GET /groups/{id}/matches`: List scheduled and completed matches with round ordering.

## Messaging Contracts
- `MatchScheduled` published when the Scheduler enqueues new fixtures.
- `MatchPlayed` emitted by the Simulation Engine after scoring.
- Exchange: `groupsim.events`; routing keys: `match.scheduled`, `match.played`.
- Queues: `groupsim.match-scheduled` (worker subscription), `groupsim.match-played` (API projection updates).
- `CorrelationId` links API request to downstream events, enabling distributed tracing and replay safety.

## Ports, Environment Variables & Connection Strings
| Component | Variable | Example Value |
| --- | --- | --- |
| API HTTP | `ASPNETCORE_URLS` | `http://0.0.0.0:<API_PORT>` |
| Database | `ConnectionStrings__Default` | `Server=db;Database=GroupStageSim;User Id=sa;Password=<YOUR_PASSWORD>;TrustServerCertificate=true;` |
| Broker | `RabbitMq__Host` | `broker` |
| Broker | `RabbitMq__Port` | `<RABBITMQ_PORT>` |
| Simulation | `Simulation__BaseRate` | `<BASE_RATE>` |
| Simulation | `Simulation__Seed` | `<DEFAULT_SEED>` |

## Naming Conventions
- Domain types and services: PascalCase (e.g., `RankingService`, `MatchResultApplier`).
- C# fields and local variables: camelCase.
- JSON payloads: camelCase property names for DTO consistency.
- Database tables: singular PascalCase (e.g., `Match`, `StandingRow`).
- Queues & exchanges: kebab-case prefixed with namespace (e.g., `groupsim.match-scheduled`).

## Links
- [ASP.NET Guidelines](./AspNetGuidelines.md)
- [Architecture Overview](./Architecture.md)
- [API Reference](./API.md)
- [Messaging Contracts](./MessagingContracts.md)
- [Ranking Rules](./RankingRules.md)
- [Simulation Model](./SimulationModel.md)
- [Deployment with Docker Compose](./Deployment-DockerCompose.md)
- [Deployment on Kubernetes](./Deployment-Kubernetes.md)
- [Runbook](./Runbook.md)
- [Testing Strategy](./Testing.md)

## Why This Matters
- Consolidates project invariants so onboarding engineers can reason about scope without hunting through code.
- Sets shared vocabulary and defaults, reducing ambiguity during interviews or architecture reviews.
- Clarifies integration points (ports, env vars, exchange names) to simplify local setup and DevOps automation.
