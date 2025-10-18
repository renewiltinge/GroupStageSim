# File: docs/Runbook.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Day-1 Start Procedure
1. Ensure `<DB_ENGINE>` and `<BROKER>` containers are healthy (Compose or Kubernetes).
2. Launch `Tournament.Api` and verify `/health/ready` returns 200.
3. Start `Simulator.Worker`; confirm it logs subscription to `groupsim.match-scheduled` queue.
4. Execute smoke script:
   - Create group via `POST /groups`.
   - Trigger simulation with `POST /groups/{id}/simulate?iterations=25`.
   - Watch `MatchScheduled` and `MatchPlayed` counts in RabbitMQ UI.

## Day-2 Operations
- **Scale up worker**: increase Compose replica or Deployment replica count to handle larger iteration counts.
- **Run migrations**: `dotnet ef database update` in API container/Pod during low traffic.
- **Purge queues**: Use RabbitMQ management UI or `rabbitmqadmin purge queue name=groupsim.match-scheduled` if backlog is invalid.

## Monitoring & Logs
- Correlation walkthrough:
  1. Capture `correlationId` from API response.
  2. Search structured logs (Seq, console) for same ID to view scheduling steps.
  3. Follow through worker logs to confirm simulation completion.
- Use RabbitMQ management charts to verify consumer throughput.

## Failure Modes
| Symptom | Likely Cause | Quick Fix |
| --- | --- | --- |
| 500 on `/simulate` | Broker unreachable | Check `RabbitMq__Host`, restart worker after broker recovery. |
| Matches stuck `Scheduled` | Worker down or DLQ filling | Inspect `groupsim.match-scheduled.dlq`, re-drive after resolving root cause. |
| Duplicate MatchPlayed events | Worker retries due to transient DB error | Ensure idempotent repository logic; clear partial writes before replay. |
| EF Core timeouts | Unbounded iterations | Reduce batch size or scale worker horizontally. |

## Backup & Restore (Local)
- Backup database: `docker compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -Q "BACKUP DATABASE GroupStageSim TO DISK='/var/opt/mssql/backup/GroupStageSim.bak'"`.
- Restore by copying `.bak` into container and running `RESTORE DATABASE` command.
- RabbitMQ: export definitions via management UI (`Definitions -> Download`) for queue/exchange recreation.

## Shutdown Procedure
1. Stop `Simulator.Worker` gracefully (`Ctrl+C` or `kubectl scale deployment simulatorworker --replicas 0`).
2. Stop `Tournament.Api` once queues drain.
3. Terminate `<BROKER>` and `<DB_ENGINE>` containers/pods if not needed.
4. Archive logs and metrics snapshots if investigating incidents.

## Why This Matters
- Operational runbook illustrates production readiness—key for senior engineering interviews.
- Clear failure tables help triage issues quickly during demos or tests.
- Correlation-first logging guidance reinforces observability principles.
