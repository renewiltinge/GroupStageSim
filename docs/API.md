# File: docs/API.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Endpoint Summary
| Method | Path | Purpose | Auth | Success |
| --- | --- | --- | --- | --- |
| POST | `/groups` | Create a new group with four teams and strengths. | N/A | 201 Created |
| POST | `/groups/{id}/simulate` | Kick off Monte Carlo iterations (`iterations` query). | N/A | 202 Accepted |
| GET | `/groups/{id}/standings` | Retrieve sorted standings rows. | N/A | 200 OK |
| GET | `/groups/{id}/matches` | List scheduled and completed matches. | N/A | 200 OK |

## POST /groups
### Request
```json
{
  "name": "Group A",
  "teams": [
    { "id": "11111111-1111-1111-1111-111111111111", "name": "Alpha FC", "strength": 1.1 },
    { "id": "22222222-2222-2222-2222-222222222222", "name": "Bravo FC", "strength": 0.9 },
    { "id": "33333333-3333-3333-3333-333333333333", "name": "Charlie FC", "strength": 1.2 },
    { "id": "44444444-4444-4444-4444-444444444444", "name": "Delta FC", "strength": 0.8 }
  ]
}
```

### Response (201)
```json
{
  "id": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "name": "Group A",
  "teams": [
    { "id": "11111111-1111-1111-1111-111111111111", "name": "Alpha FC", "strength": 1.1 },
    { "id": "22222222-2222-2222-2222-222222222222", "name": "Bravo FC", "strength": 0.9 },
    { "id": "33333333-3333-3333-3333-333333333333", "name": "Charlie FC", "strength": 1.2 },
    { "id": "44444444-4444-4444-4444-444444444444", "name": "Delta FC", "strength": 0.8 }
  ],
  "createdAt": "2025-10-17T12:34:56Z",
  "correlationId": "f9e0e2a4-7b6a-4dfd-9d8f-4c3a0a7d1234"
}
```

## POST /groups/{id}/simulate?iterations=N
### Request
```
POST /groups/6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567/simulate?iterations=250
```

### Response (202)
```json
{
  "groupId": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "iterations": 250,
  "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab",
  "status": "Queued"
}
```

## GET /groups/{id}/standings
### Response (200)
```json
{
  "groupId": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "roundsCompleted": 3,
  "rows": [
    {
      "teamId": "33333333-3333-3333-3333-333333333333",
      "teamName": "Charlie FC",
      "played": 3,
      "wins": 2,
      "draws": 1,
      "losses": 0,
      "goalsFor": 6,
      "goalsAgainst": 2,
      "goalDifference": 4,
      "points": 7
    },
    {
      "teamId": "11111111-1111-1111-1111-111111111111",
      "teamName": "Alpha FC",
      "played": 3,
      "wins": 1,
      "draws": 1,
      "losses": 1,
      "goalsFor": 4,
      "goalsAgainst": 3,
      "goalDifference": 1,
      "points": 4
    },
    {
      "teamId": "22222222-2222-2222-2222-222222222222",
      "teamName": "Bravo FC",
      "played": 3,
      "wins": 1,
      "draws": 0,
      "losses": 2,
      "goalsFor": 3,
      "goalsAgainst": 5,
      "goalDifference": -2,
      "points": 3
    },
    {
      "teamId": "44444444-4444-4444-4444-444444444444",
      "teamName": "Delta FC",
      "played": 3,
      "wins": 0,
      "draws": 1,
      "losses": 2,
      "goalsFor": 2,
      "goalsAgainst": 5,
      "goalDifference": -3,
      "points": 1
    }
  ],
  "updatedAt": "2025-10-17T12:45:00Z",
  "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab"
}
```

## GET /groups/{id}/matches
### Response (200)
```json
{
  "groupId": "6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567",
  "matches": [
    {
      "matchId": "9e2d5c4b-5f1c-4cb3-81cd-bff8f70a9012",
      "round": 1,
      "homeTeamId": "11111111-1111-1111-1111-111111111111",
      "awayTeamId": "22222222-2222-2222-2222-222222222222",
      "scheduledKickoff": "2025-10-17T13:00:00Z",
      "status": "Played",
      "homeScore": 2,
      "awayScore": 1
    },
    {
      "matchId": "f84039d2-2055-4d50-ae82-5794a6dfcd31",
      "round": 1,
      "homeTeamId": "33333333-3333-3333-3333-333333333333",
      "awayTeamId": "44444444-4444-4444-4444-444444444444",
      "scheduledKickoff": "2025-10-17T15:00:00Z",
      "status": "Played",
      "homeScore": 3,
      "awayScore": 1
    },
    {
      "matchId": "3d3a7487-7c60-4cdd-95ef-5a3321e48551",
      "round": 2,
      "homeTeamId": "11111111-1111-1111-1111-111111111111",
      "awayTeamId": "33333333-3333-3333-3333-333333333333",
      "scheduledKickoff": "2025-10-20T13:00:00Z",
      "status": "Played",
      "homeScore": 1,
      "awayScore": 1
    },
    {
      "matchId": "7c59968d-21f7-4df0-92d2-9db60a83b5f9",
      "round": 2,
      "homeTeamId": "22222222-2222-2222-2222-222222222222",
      "awayTeamId": "44444444-4444-4444-4444-444444444444",
      "scheduledKickoff": "2025-10-20T15:00:00Z",
      "status": "Played",
      "homeScore": 2,
      "awayScore": 0
    },
    {
      "matchId": "6f47b674-8dd8-4938-b77a-2d15f1a879b6",
      "round": 3,
      "homeTeamId": "44444444-4444-4444-4444-444444444444",
      "awayTeamId": "11111111-1111-1111-1111-111111111111",
      "scheduledKickoff": "2025-10-24T13:00:00Z",
      "status": "Scheduled"
    },
    {
      "matchId": "b54f9052-6524-47d5-8de1-8c53f4fd7bcf",
      "round": 3,
      "homeTeamId": "22222222-2222-2222-2222-222222222222",
      "awayTeamId": "33333333-3333-3333-3333-333333333333",
      "scheduledKickoff": "2025-10-24T15:00:00Z",
      "status": "Scheduled"
    }
  ],
  "updatedAt": "2025-10-17T12:46:10Z",
  "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab"
}
```

## Error Model
- All errors return RFC 7807 ProblemDetails with camelCase extensions.
```json
{
  "type": "https://httpstatuses.com/422",
  "title": "Validation failure",
  "status": 422,
  "detail": "Team strengths must be positive.",
  "instance": "/groups",
  "extensions": {
    "correlationId": "706d8b92-2a91-4cb7-8b44-fd8c45e570ab",
    "errors": {
      "teams[2].strength": ["Strength must be above 0.1"]
    }
  }
}
```

## Curl Examples
```powershell
# Create group
curl -X POST "http://localhost:<API_PORT>/groups" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Group A",
    "teams": [
      { "id": "11111111-1111-1111-1111-111111111111", "name": "Alpha FC", "strength": 1.1 },
      { "id": "22222222-2222-2222-2222-222222222222", "name": "Bravo FC", "strength": 0.9 },
      { "id": "33333333-3333-3333-3333-333333333333", "name": "Charlie FC", "strength": 1.2 },
      { "id": "44444444-4444-4444-4444-444444444444", "name": "Delta FC", "strength": 0.8 }
    ]
  }'

# Trigger simulation
curl -X POST "http://localhost:<API_PORT>/groups/6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567/simulate?iterations=250"

# Read standings
curl "http://localhost:<API_PORT>/groups/6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567/standings"

# List matches
curl "http://localhost:<API_PORT>/groups/6d0d85c9-a4d3-4a6c-94d4-6a0d07e34567/matches"
```

## Why This Matters
- Provides interview-ready contract knowledge so you can recite endpoints and payloads with confidence.
- Concrete examples demonstrate JSON shapes and correlation behaviour, removing ambiguity when implementing clients.
- Curl snippets double as smoke tests to validate deployments quickly.
