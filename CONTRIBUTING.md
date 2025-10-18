# File: CONTRIBUTING.md

<PROJECT_NAME>=GroupStageSim · <DB_ENGINE>=SQL Server · <BROKER>=RabbitMQ · <NAMESPACE>=groupsim · <API_PORT>=5180 · <DB_PORT>=1433 · <RABBITMQ_PORT>=5672 · <BASE_RATE>=1.3 · <HOME_ADV>=1.05 · <AWAY_MOD>=0.95 · <DEFAULT_SEED>=42

## Branching & Commits
- Adopt GitHub Flow: feature branches named `feature/<short-description>` off `main`.
- Write conventional commits (`feat: add ranking mini-table`) to streamline release notes.

## Code Style
- Enable `.editorconfig`; format with `dotnet format` before pushing.
- Follow analyzer guidance (warnings as errors). Address nullable warnings explicitly.
- Keep controllers under 200 lines; extract services when logic grows.

## Pull Request Checklist
- [ ] Unit tests updated or added (scheduler, ranking, simulation).
- [ ] Integration tests for new endpoints or event flows.
- [ ] Swagger docs and XML comments updated.
- [ ] Migrations named and documented if schema changes.
- [ ] Run `dotnet build` and `dotnet test` locally.
- [ ] Update relevant docs in `/docs` when behaviour changes.

## Pre-Commit Hooks
- Use `dotnet format` and `dotnet test` via optional Husky/lefthook scripts.
- For JavaScript tooling (Swagger UI tweaks), run `npm test` if package present.

## Review Expectations
- Provide architectural rationale when introducing new dependencies.
- Call out performance implications (DB queries, message fan-out).
- Ensure ProblemDetails contract remains consistent.

## Why This Matters
- Maintains high bar for contributions, reflecting senior-level stewardship.
- Consistent processes simplify onboarding and reduce regressions in a simulation-heavy codebase.
- Promotes documentation-first mindset aligned with project goals.
