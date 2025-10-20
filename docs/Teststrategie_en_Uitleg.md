# Teststrategie en Uitleg

## Doelen
De teststrategie richt zich op drie pijlers:
1. Functionele juistheid van kernlogica (ranking, scheduler, simulatie jobs).
2. Statistische betrouwbaarheid van de simulatie (Poisson-engine, thuisvoordeel, deterministische seeding).
3. End-to-end integriteit van het berichtenverkeer en API-laag (RabbitMQ ↔ Worker ↔ Database ↔ API).

## Testtypen
- Unit tests: Focussen op pure logica zonder externe afhankelijkheden. Gebruik van FluentAssertions voor expressieve checks en NSubstitute voor mocking.
- Statistische tests: Snelle sampling (≈ 2.000 iteraties) om probabilistische verwachtingen te controleren zonder trage runtimes.
- Integratietests: Testcontainers voor het opzetten van echte afhankelijkheden (SQL Server, RabbitMQ) en `WebApplicationFactory` voor het hosten van de API in-memory.

## Naming Conventies
Bestandsnamen eindigen op `Tests.cs`, b.v. `SchedulerTests.cs`. Elke testmethode beschrijft gedrag: `MethodName_Condition_ExpectedResult`.

## Determinisme & Reproduceerbaarheid
- PoissonSimulationEngine gebruikt een seed gebaseerd op `(DefaultSeed, MatchId, Iteration)` zodat dezelfde combinatie altijd hetzelfde resultaat geeft.
- Tests vermijden afhankelijkheid van actuele tijd behalve voor scheduling (controle via vaste `DateTimeOffset`).
- Statistische testen hanteren toleranties (geen exacte distributie eisen, enkel trend: thuiswinstpercentage > 40% en hoger dan gelijkspelpercentage).

## Tie-Breaker Validatie
RankingService wordt getest met:
- Geen wedstrijden → alle rijen nulwaarden.
- Primaire sortering (punten, doelsaldo, goals voor, goals tegen).
- Twee- en drieweg head-to-head situaties waarin alleen onderlinge duels bepalend zijn voor uiteindelijke volgorde.

## Scheduler Validatie
- Exact 6 unieke wedstrijden voor 4 teams, verdeeld over 3 rondes.
- Geen team twee keer in dezelfde ronde.
- Chronologische kickoffs met increment van 1 dag vanaf eerste starttijd.

## Simulatie Jobs
- Overgangsstaten: `Queued` → `Running` → `Completed` op basis van aantal verwerkte wedstrijden.
- Directe voltooiing bij 0 wedstrijden (edge case).

## Integratie Test Aanpak
1. Testcontainers starten SQL Server + RabbitMQ dynamisch op ephemeral poorten.
2. Injecteer connection string & broker configuratie via test-specifieke host builder overrides (TODO in scaffold).
3. Arrange: Maak een groep via API → schedule wedstrijden → trigger simulatie.
4. Worker consumeert berichten en publiceert resultaten → API exposeert bijgewerkte standen.
5. Assert: Poll endpoints tot simulatiejob `Completed` en standen consistent met gesimuleerde uitslagen.

## Performance & Snelheid
- Samplegrootte statistische test beperkt tot 2.000 voor balans tussen snelheid en betrouwbaarheid (< 1s op gangbare hardware).
- Integratietests gebruiken minimale dataset (één groep, beperkt aantal wedstrijden). Parallelisatie kan later via xUnit collection definitions.

## Uitbreidbaarheid
- Nieuwe tie-breaker criteria: voeg testset toe vóór implementatie (TDD) met duidelijke scenario matrix.
- Extra simulatiemodellen: vergelijk baseline Poisson output met nieuw model (A/B asserties op distributies).

## Quality Gates
Voor afronding van PR:
- `dotnet build` zonder waarschuwingen (streven).
- `dotnet test --collect:"XPlat Code Coverage"` retourneert > 70% dekking voor Application + Domain logica (streefwaarde, geen harde blocker in beginfase).
- Geen hard-gecodeerde geheimen; alle integratietests gebruiken ephemeral container credentials.

## Bekende TODO's
- Injectie van testcontainers configuratie in API/Worker host (scaffold staat klaar, implementatie volgt).
- Volledige end-to-end test van berichtflow (nog te bouwen scenario).
- Coverage rapport integreren in CI (GitHub Actions workflow toevoegen).

## Samenvatting
Deze strategie borgt zowel deterministische kernlogica als probabilistische eigenschappen van de simulatie. Door Testcontainers te gebruiken ontstaat realistische omgeving zonder complexe lokale setup. Uitbreiding naar volledige end-to-end scenario's volgt met incrementele iteraties zodat feedback snel beschikbaar blijft.
