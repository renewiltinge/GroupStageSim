# GroupStageSim

A tournament simulation system that creates 4-team group stages, simulates matches using Poisson distribution, and ranks teams with deterministic tie-breaker rules.

## Quick Start

### Environment variables
```bash
SA_PASSWORD=YourStrongDatabasePassword!
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```



```powershell
git clone https://github.com/your-org/GroupStageSim.git
cd GroupStageSim

# Copy environment file and configure passwords
copy .env.example .env
# Edit .env with your database/RabbitMQ passwords

# Start with Docker
docker compose up --build -d

# Access the application
Web UI: http://localhost:5180/ui
Swagger API: http://localhost:5180/swagger
```

## Tournament Rules

### Group Stage Format
- **4 teams** per group in round-robin format
- **6 matches** total (3 rounds, each team plays once per round)
- **Points**: 3 for win, 1 for draw, 0 for loss

### Tie-Breaking Rules
When teams have equal points, ranking is determined by:

1. **Points** - Total points earned
2. **Goal Difference (GD)** - Goals scored minus goals conceded  
3. **Goals For (GF)** - Total goals scored
4. **Goals Against (GA)** - Total goals conceded (lower is better)
5. **Head-to-Head Record** - Direct comparison between tied teams

#### Head-to-Head Process
- Extract matches between tied teams only
- Create mini-table with those results
- Apply same ranking criteria (Points → GD → GF → GA)
- If still tied, use alphabetical order (deterministic fallback)

### Match Simulation
- **Poisson distribution** for goal generation
- **Home advantage**: 1.05x multiplier
- **Away disadvantage**: 0.95x multiplier  
- **Base scoring rate**: 1.3 goals per team per match
- **Deterministic**: Same seed produces identical results

## Example Output

```
Pos  Team     P  W  D  L  GF  GA  GD  Pts
1    Charlie  3  2  1  0   6   2   4    7   [Qualified]
2    Alpha    3  1  1  1   4   3   1    4   [Qualified]  
3    Bravo    3  1  0  2   3   5  -2   3
4    Delta    3  0  1  2   2   5  -3   1
```

## Technical Stack
- **.NET 8** ASP.NET Core API
- **SQL Server** for persistence
- **RabbitMQ** for event messaging
- **Docker Compose** for local development
- **Bootstrap 5** for responsive UI

