# File: docs/Deployment-DockerCompose.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Service Matrix
| Service | Image | Ports | Depends On |
| --- | --- | --- | --- |
| `<DB_ENGINE>` | `mcr.microsoft.com/mssql/server:2022-latest` | `<DB_PORT>:1433` | - |
| `<BROKER>` | `rabbitmq:3.12-management` | `<RABBITMQ_PORT>:5672`, `15672:15672` | - |
| Tournament.Api | `groupstagesim/api:latest` | `<API_PORT>:5180` | db, broker |
| Simulator.Worker | `groupstagesim/worker:latest` | n/a | broker, api |

## Environment Variables
| Component | Variable | Value |
| --- | --- | --- |
| API | `ConnectionStrings__Default` | `Server=db;Database=GroupStageSim;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;` |
| API | `RabbitMq__Host` | `broker` |
| Worker | `Simulation__BaseRate` | `<BASE_RATE>` |
| Worker | `RabbitMq__Host` | `broker` |
| SQL | `ACCEPT_EULA` | `Y` |
| SQL | `SA_PASSWORD` | `ChangeM3Now!` (override in `.env`) |

## docker-compose.yml (Excerpt)
```yaml
version: "3.9"
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: ${SA_PASSWORD}
    ports:
      - "<DB_PORT>:1433"
    volumes:
      - mssql-data:/var/opt/mssql
  broker:
    image: rabbitmq:3.12-management
    ports:
      - "<RABBITMQ_PORT>:5672"
      - "15672:15672"
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
  api:
    build: ./src/Tournament.Api
    ports:
      - "<API_PORT>:5180"
    environment:
      ConnectionStrings__Default: "Server=db;Database=GroupStageSim;User Id=sa;Password=${SA_PASSWORD};TrustServerCertificate=true;"
      RabbitMq__Host: broker
      RabbitMq__Port: "<RABBITMQ_PORT>"
    depends_on:
      - db
      - broker
  worker:
    build: ./src/Simulator.Worker
    environment:
      RabbitMq__Host: broker
      RabbitMq__Port: "<RABBITMQ_PORT>"
      Simulation__BaseRate: "<BASE_RATE>"
      Simulation__Seed: "<DEFAULT_SEED>"
    depends_on:
      - api
      - broker
volumes:
  mssql-data:
  rabbitmq-data:
```

## Workflow
```powershell
# 1. Provide secrets
Copy-Item .env.sample .env
# Edit SA_PASSWORD and optional overrides

# 2. Build & start
docker compose up --build -d

# 3. Apply migrations (first run)
docker compose exec api dotnet ef database update --project src/Infrastructure --startup-project src/Tournament.Api

# 4. Tail logs
docker compose logs -f api worker

# 5. Tear down
docker compose down
```

## Health Verification
- Browse Swagger at `http://localhost:<API_PORT>/swagger` after services are healthy.
- Check RabbitMQ at `http://localhost:15672` (default guest/guest) to confirm `groupsim.events` exchange and queues exist.
- Verify database tables with `docker compose exec db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -Q "SELECT COUNT(*) FROM Match"`.

## Why This Matters
- Offers a repeatable local environment story—critical for demos and interviews.
- Ensures infra parity with production-like brokers and databases for integration testing.
- Documented commands reduce friction and highlight operational competence.
