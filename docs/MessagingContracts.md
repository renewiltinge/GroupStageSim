# File: docs/MessagingContracts.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Event Records
### MatchScheduled
```json
{
  "matchId": "9e2d5c4b-5f1c-4cb3-81cd-bff8f70a9012",
  "groupId": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "homeTeamId": "11111111-1111-1111-1111-111111111111",
  "awayTeamId": "22222222-2222-2222-2222-222222222222",
  "round": 1,
  "scheduledKickoff": "2025-10-17T13:00:00Z",
  "iterations": 250,
  "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab"
}
```
```csharp
/// <summary>
/// Event emitted when the scheduler creates a new fixture to simulate.
/// </summary>
public sealed record MatchScheduled(
    Guid MatchId,
    Guid GroupId,
    Guid HomeTeamId,
    Guid AwayTeamId,
    int Round,
    DateTimeOffset ScheduledKickoff,
    int Iterations,
    Guid CorrelationId);
```

### MatchPlayed
```json
{
  "matchId": "9e2d5c4b-5f1c-4cb3-81cd-bff8f70a9012",
  "groupId": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "homeScore": 2,
  "awayScore": 1,
  "iteration": 1,
  "completedAt": "2025-10-17T13:05:10Z",
  "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab"
}
```
```csharp
/// <summary>
/// Event published by the simulation engine once a match outcome is generated.
/// </summary>
public sealed record MatchPlayed(
    Guid MatchId,
    Guid GroupId,
    int HomeScore,
    int AwayScore,
    int Iteration,
    DateTimeOffset CompletedAt,
    Guid CorrelationId);
```

## Broker Topology
| Element | Name | Notes |
| --- | --- | --- |
| Exchange | `groupsim.events` | Topic exchange, durable=true, autoDelete=false |
| Queue | `groupsim.match-scheduled` | Worker subscription to `match.scheduled` |
| Queue | `groupsim.match-played` | API projection listener (optional) |
| Routing Key | `match.scheduled` | Emitted by Scheduler |
| Routing Key | `match.played` | Emitted by Simulator |
| DLQ | `groupsim.match-scheduled.dlq` | Bind to `groupsim.events` with `match.scheduled.deadletter` |

## Delivery Guarantees & Idempotency
- Target at-least-once delivery with publisher confirms and consumer acknowledgements.
- Store processed event IDs or use `MatchId` + `Iteration` as natural deduplication keys per consumer.
- Retry policy: exponential backoff (3 attempts) followed by DLQ; operator replays via Runbook instructions.

## CorrelationId Usage
- API generates a `CorrelationId` per request and stores it alongside group and match records.
- Propagate `CorrelationId` through headers (`x-correlation-id`) and log scopes to stitch distributed traces.

## Why This Matters
- Clear contracts prevent accidental schema drift between publisher and consumer teams.
- Documented topology accelerates infrastructure setup and ensures durability defaults are correct.
- Idempotency and correlation guidance protect against replay bugs and simplify debugging narratives.
