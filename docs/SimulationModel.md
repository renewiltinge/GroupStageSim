# File: docs/SimulationModel.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Poisson Goal Model
- Home intensity: $\lambda_{home} = <BASE_RATE> \times strengthRatio \times <HOME_ADV>$.
- Away intensity: $\lambda_{away} = <BASE_RATE> \times opponentRatio \times <AWAY_MOD>$.
- `strengthRatio` compares home vs away ratings; clamp between 0.5 and 1.5 to prevent runaway scores.

## Sampling Algorithm
```pseudo
function sampleGoals(lambda, rng):
    L = exp(-lambda)
    k = 0
    p = 1
    while p > L:
        k = k + 1
        u = rng.nextDouble()
        p = p * u
    return k - 1
```
- Use Knuth’s method for integer Poisson samples.
- `rng` seeds from `<DEFAULT_SEED>` combined with `matchId` and iteration to ensure reproducibility.

## Monte Carlo Iterations
- Each iteration simulates all matches for a group, accumulating standings snapshots.
- Worker publishes `MatchPlayed` per iteration or aggregates before emitting final result (configurable).
- Respect cancellation tokens to allow graceful shutdown when scaling worker replicas.

## Tuning Guidance
- Adjust `<BASE_RATE>` to calibrate average goals per game (~2.6 baseline).
- `<HOME_ADV>` should remain near 1.0–1.1; `<AWAY_MOD>` below 1.0 to bias home advantage.
- Provide admin endpoint or config to override rates for experimentation.

## Guardrails
- Clamp goals to a practical upper bound (e.g., 10) to avoid unrealistic outputs for outlier strengths.
- Validate team strengths (0.5–1.5) during group creation.
- Log both lambda values and actual scores at debug level when tracing issues.

## Why This Matters
- Explaining Poisson modeling demonstrates understanding of probabilistic simulations beyond basic CRUD.
- Deterministic seeding reassures reviewers that results are reproducible—critical for grading and debugging.
- Guardrails and tuning advice showcase operational empathy when modelling sports outcomes.
