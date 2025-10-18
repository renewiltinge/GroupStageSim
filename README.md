# File: README.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Overview
<PROJECT_NAME> is an event-driven .NET 8 backend that schedules a four-team group stage, simulates match outcomes with a Poisson engine, and ranks teams using deterministic tie-breakers.

## Quickstart (Docker Compose)
```powershell
# Clone & enter repo
git clone https://github.com/your-org/GroupStageSim.git
cd GroupStageSim

# Configure secrets
type NUL > .env # or copy provided sample and fill SA_PASSWORD

# Run stack
docker compose up --build -d

# Smoke test
dotnet tool install --global HttpRepl # optional
curl http://localhost:<API_PORT>/swagger
```

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
