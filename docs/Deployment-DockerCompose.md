# File: docs/Deployment-DockerCompose.md

Project: GroupStageSim · Database: SQL Server · Broker: RabbitMQ · Namespace: groupsim · API Port: 5180 · SQL Port: 7272 · RabbitMQ Port: 5672 · Base Rate: 1.3 · Home Adv: 1.05 · Away Mod: 0.95 · Default Seed: 42

## Service Matrix
| Service | Image | Ports | Depends On |
| --- | --- | --- | --- |
| `sqlserver` | `mcr.microsoft.com/mssql/server:2022-latest` | `7272:1433` | - |
| `rabbitmq` | `rabbitmq:3-management` | `5672:5672`, `15672:15672` | - |
| `tournament-api` | `src/Tournament.Api` (Dockerfile) | `5180:8080` | sqlserver ✅, rabbitmq ✅ |
| `simulator-worker` | `src/Simulator.Worker` (Dockerfile) | n/a | sqlserver ✅, rabbitmq ✅ |

## Environment Variables
| Component | Variable | Default | Notes |
| --- | --- | --- | --- |
| SQL Server | `SA_PASSWORD` | `P@ssw0rd1234!` | Set in `.env`; change for any shared instance |
| RabbitMQ | `RABBITMQ_USER` | `guest` | Mirrors RabbitMQ defaults |
| RabbitMQ | `RABBITMQ_PASSWORD` | `guest` | Mirrors RabbitMQ defaults |
| API / Worker | `ConnectionStrings__Default` | `Server=sqlserver,1433;Database=GroupStageSim;User Id=sa;Password=${SA_PASSWORD};Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True` | Provided via environment variables when running in Docker |
| API / Worker | `Broker__HostName` | `rabbitmq` | Fallback for `RabbitMq` section |
| API / Worker | `Broker__Port` | `5672` | Consumed by infrastructure DI |
| API / Worker | `Broker__UserName` | `${RABBITMQ_USER}` | Used when `Broker` section present |
| API / Worker | `Broker__Password` | `${RABBITMQ_PASSWORD}` | Used when `Broker` section present |

## docker-compose.yml (Excerpt)
```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_PID=Express
      - SA_PASSWORD=${SA_PASSWORD:-P@ssw0rd1234!}
    ports:
      - "7272:1433"
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $$SA_PASSWORD -Q 'SELECT 1' || exit 1"]
    volumes:
      - mssql_data:/var/opt/mssql

  rabbitmq:
    image: rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=${RABBITMQ_USER:-guest}
      - RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD:-guest}
    ports:
      - "5672:5672"
      - "15672:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]

  tournament-api:
    build:
      context: .
      dockerfile: ./src/Tournament.Api/Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Docker
      - ConnectionStrings__Default=Server=sqlserver,1433;Database=GroupStageSim;User Id=sa;Password=${SA_PASSWORD:-P@ssw0rd1234!};Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True
      - Broker__HostName=rabbitmq
      - Broker__Port=5672
      - Broker__UserName=${RABBITMQ_USER:-guest}
      - Broker__Password=${RABBITMQ_PASSWORD:-guest}
    ports:
      - "5180:8080"
    depends_on:
      sqlserver:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]

  simulator-worker:
    build:
      context: .
      dockerfile: ./src/Simulator.Worker/Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Docker
      - ConnectionStrings__Default=Server=sqlserver,1433;Database=GroupStageSim;User Id=sa;Password=${SA_PASSWORD:-P@ssw0rd1234!};Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True
      - Broker__HostName=rabbitmq
      - Broker__Port=5672
      - Broker__UserName=${RABBITMQ_USER:-guest}
      - Broker__Password=${RABBITMQ_PASSWORD:-guest}
    depends_on:
      sqlserver:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

volumes:
  mssql_data:
```

## Workflow
```powershell
# 1. Provide secrets (overwrite defaults as needed)
Set-Content .env "SA_PASSWORD=P@ssw0rd1234!`nRABBITMQ_USER=guest`nRABBITMQ_PASSWORD=guest"

# 2. Build and start the full stack
docker compose up --build -d

# 3. Tail logs until services report healthy
docker compose logs -f tournament-api simulator-worker

# 4. Open the API surface
Start-Process http://localhost:5180/swagger

# 5. Stop the stack (add -v to clear volumes)
docker compose down
docker compose down -v
```

> Migrations run automatically at startup for the API when `ASPNETCORE_ENVIRONMENT` is `Docker`, so no manual `dotnet ef database update` command is required for the compose story.

## Health Verification
- Browse Swagger at `http://localhost:5180/swagger` after services are healthy.
- Check RabbitMQ at `http://localhost:15672` (default guest/guest) to confirm `groupsim.events` exchange and queues exist.
- Query SQL Server with `docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${SA_PASSWORD} -Q "SELECT name FROM sys.tables"`.

## Why This Matters
- Offers a repeatable local environment story—critical for demos and interviews.
- Ensures infra parity with production-like brokers and databases for integration testing.
- Documented commands reduce friction and highlight operational competence.
