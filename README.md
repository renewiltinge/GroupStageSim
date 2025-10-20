635.# File: README.md

Project: GroupStageSim · Database: SQL Server · Broker: RabbitMQ · Namespace: groupsim · API Port: 5180 · SQL Port: 7272 · RabbitMQ Port: 5672 · Base Rate: 1.3 · Home Adv: 1.05 · Away Mod: 0.95 · Default Seed: 42

## Overview
GroupStageSim is an event-driven .NET 8 backend that schedules a four-team group stage, simulates match outcomes with a Poisson engine, and ranks teams using deterministic tie-breakers.

## Config & Secrets

This project uses secure-by-default configuration:
- **No secrets in committed files** - All credentials must be provided via environment variables
- **`.env` file** - Copy `.env.example` to `.env` and configure your secrets locally (DO NOT COMMIT)
- **Environment precedence**: Environment variables override appsettings.{Environment}.json which overrides appsettings.json

### Required Environment Variables
```bash
SA_PASSWORD=YourStrongDatabasePassword!
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

### Optional Overrides
```bash
CONNECTIONSTRINGS__DEFAULT=Server=localhost,7272;Database=GroupStageSim;...
BROKER__HOSTNAME=localhost
BROKER__PORT=5672
BROKER__USERNAME=guest  
BROKER__PASSWORD=guest
```

## Quickstart (Docker Compose)
| Component | Host Port | Notes |
| --- | --- | --- |
| API | `http://localhost:5180` | Swagger at `/swagger`, health at `/healthz` + `/healthz/ready` |
| SQL Server | `localhost,7272` | SA login from `.env` |
| RabbitMQ | `localhost:5672` (`AMQP`), `localhost:15672` (management UI) | Credentials from `.env` |

```powershell
# Clone & enter repo
git clone https://github.com/your-org/GroupStageSim.git
cd GroupStageSim

# Copy example env file and configure your secrets
copy .env.example .env
# Edit .env with your preferred passwords

# Build images and start services (API runs on http://localhost:5180)
docker compose up --build -d

# Verify readiness
docker compose ps
curl http://localhost:5180/healthz/ready
Start-Process http://localhost:15672
```

Once the containers report `running (healthy)`, open [http://localhost:5180/ui](http://localhost:5180/ui) for the web surface or inspect the OpenAPI definition at [http://localhost:5180/swagger](http://localhost:5180/swagger).

> 🪄 Migrations are applied automatically on startup for the API when running with the `Docker` or `Development` environment profiles.

Stop the stack with `docker compose down` (add `-v` to clear persisted SQL data).

## Local Development (dotnet run)
- Ensure Docker Desktop is running so the infrastructure containers can start.
- Start shared services: `docker compose up -d sqlserver rabbitmq`
- Run the API locally: `dotnet run --project src/Tournament.Api`
- In a second terminal, run the simulator worker: `dotnet run --project src/Simulator.Worker`

The API listens on `https://localhost:7180` and `http://localhost:5180` by default when using Kestrel with certificates enabled. Connection strings still point at `localhost,7272`, so the compose-hosted SQL instance is reused.

## Web UI
- Start the stack with `dotnet run --project src/Tournament.Api` or `docker compose up` so the API and simulator worker are available.
- Open [http://localhost:5180/ui](http://localhost:5180/ui) to launch the reviewer UI.
- Use **Create Group** to accept the default four teams (Alpha, Bravo, Charlie, Delta) or adjust strengths, then submit the form.
- On the details screen, press **Simulate Once** to enqueue a single Monte Carlo run (or specify more iterations) and wait a moment while the page polls the REST API.
- Review the updated standings and match results, or jump to the OpenAPI surface at [http://localhost:5180/swagger](http://localhost:5180/swagger).

![Screenshot of the GroupStageSim web UI](docs/images/ui-screenshot.png)

## Prerequisites
- .NET 8 SDK
- Docker Desktop (with Compose v2)
- kubectl + minikube or kind for Kubernetes walkthrough
- Optional: RabbitMQ management plugin familiarity

## Documentation Map
- [Memory Bank](./docs/MemoryBank.md)
- [ASP.NET Guidelines](./docs/AspNetGuidelines.md)
- [Architecture](./docs/Architecture.md)
- [API Reference](./docs/API.md)
- [Messaging Contracts](./docs/MessagingContracts.md)
- [Ranking Rules](./docs/RankingRules.md)
- [Simulation Model](./docs/SimulationModel.md)
- [Deployment (Docker Compose)](./docs/Deployment-DockerCompose.md)
- [Deployment (Kubernetes)](./docs/Deployment-Kubernetes.md)
- [Runbook](./docs/Runbook.md)
- [Testing Strategy](./docs/Testing.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Sample Standings Output
```text
Group: Group A (correlationId=706d8b92-2a91-4cb7-8b44-fd8c45e570ab)
-----------------------------------------------
Team       P  W  D  L  GF  GA  GD  Pts
Charlie    3  2  1  0   6   2   4    7
Alpha      3  1  1  1   4   3   1    4
Bravo      3  1  0  2   3   5  -2    3
Delta      3  0  1  2   2   5  -3    1
```

## Next Steps
- Explore `/deploy/k8s` for cluster deployment.
- Extend simulation iterations or integrate front-end scoreboard.

## Why This Matters
- Equips you with a single page to recall system purpose, setup, and artefacts moments before an interview.
- Demonstrates operational maturity by linking infra, testing, and documentation resources cohesively.
- Provides copy-paste commands for quick demos, reducing prep time.
