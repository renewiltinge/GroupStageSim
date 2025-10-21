(() => {
    "use strict";

    const state = window.groupDetailsState ?? {};
    const groupId = state.groupId;
    if (!groupId) {
        return;
    }

    const standingsContainer = document.getElementById("standings-container");
    const matchesContainer = document.getElementById("matches-container");
    const loadingIndicator = document.getElementById("loading-indicator");
    const simulateOnceButton = document.getElementById("simulate-once");
    const resetButton = document.getElementById("reset");
    const refreshButton = document.getElementById("refresh");
    const alertElement = document.getElementById("global-alert");
    const alertTextElement = document.getElementById("global-alert-text");
    const alertRetryButton = document.getElementById("global-alert-retry");

    const teamNames = new Map(Object.entries(state.teamNames ?? {}));
    let retryHandler = null;
    const tieBreakerCollapseId = state.tieBreakerCollapseId ?? "tie-breaker-rules";

    const createHandledError = (message) => {
        const error = new Error(message);
        error.handled = true;
        return error;
    };

    const hideAlert = () => {
        if (!alertElement) {
            return;
        }

        alertElement.hidden = true;
        alertElement.classList.remove("show", "alert-danger", "alert-warning", "alert-info", "alert-success");
        alertTextElement.textContent = "";
        alertRetryButton.classList.add("d-none");
        retryHandler = null;
    };

    const showAlert = (message, tone = "danger", onRetry) => {
        if (!alertElement) {
            return;
        }

        alertElement.classList.remove("alert-danger", "alert-warning", "alert-info", "alert-success");
        alertElement.classList.add(`alert-${tone}`);
        alertTextElement.textContent = message;
        alertElement.hidden = false;
        alertElement.classList.add("show");

        if (typeof onRetry === "function") {
            retryHandler = onRetry;
            alertRetryButton.classList.remove("d-none");
        } else {
            alertRetryButton.classList.add("d-none");
            retryHandler = null;
        }
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            loadingIndicator.classList.remove("d-none");
        } else {
            loadingIndicator.classList.add("d-none");
        }

        [simulateOnceButton, resetButton, refreshButton].forEach((element) => {
            if (!element) {
                return;
            }

            element.toggleAttribute("disabled", isLoading);
        });
    };

    const activateTooltips = () => {
        if (!window.bootstrap || !window.bootstrap.Tooltip) {
            return;
        }

        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach((element) => {
            new window.bootstrap.Tooltip(element);
        });
    };



    const ensureTeamNames = (rows) => {
        rows.forEach((row) => {
            if (!teamNames.has(row.teamId)) {
                teamNames.set(row.teamId, row.teamName);
            }
        });
    };

    const renderStandings = (rows) => {
        if (!standingsContainer) {
            return;
        }

        if (!rows || rows.length === 0) {
            standingsContainer.innerHTML = '<p class="text-muted">Standings will appear after simulations run.</p>';
            return;
        }

    ensureTeamNames(rows);

    const existingCollapse = standingsContainer.querySelector(`#${tieBreakerCollapseId}`);
    const wasExpanded = existingCollapse?.classList.contains("show") ?? false;
    const collapseButtonClass = `btn btn-link p-0 text-decoration-none d-flex align-items-center w-100${wasExpanded ? "" : " collapsed"}`;
    const collapsePanelClass = `collapse${wasExpanded ? " show" : ""}`;

        let body = "";
        rows.forEach((row, index) => {
            const qualifiedClass = index < 2 ? "qualified" : "";
            const badge = index < 2 ? '<span class="badge bg-success ms-2">Qualified</span>' : "";
            body += `
                <tr class="${qualifiedClass}">
                    <th scope="row">${index + 1}</th>
                    <td><span class="team-name" title="${row.teamName}">${row.teamName}</span>${badge}</td>
                    <td>${row.played}</td>
                    <td>${row.wins}</td>
                    <td>${row.draws}</td>
                    <td>${row.losses}</td>
                    <td>${row.goalsFor}</td>
                    <td>${row.goalsAgainst}</td>
                    <td>${row.goalDifference}</td>
                    <td>${row.points}</td>
                </tr>`;
        });

        standingsContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Pos</th>
                            <th scope="col">Team</th>
                            <th scope="col">P</th>
                            <th scope="col">W</th>
                            <th scope="col">D</th>
                            <th scope="col">L</th>
                            <th scope="col">GF</th>
                            <th scope="col">GA</th>
                            <th scope="col">GD</th>
                            <th scope="col">Pts</th>
                        </tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>
            
            <!-- Tie-Breaker Rules Collapsible Card -->
            <div class="mt-3">
                <div class="card bg-light border-0">
                    <div class="card-header bg-transparent border-0 py-2 px-3">
                        <button class="${collapseButtonClass}" type="button" 
                                data-bs-toggle="collapse" data-bs-target="#${tieBreakerCollapseId}" aria-expanded="${wasExpanded ? "true" : "false"}" aria-controls="${tieBreakerCollapseId}">
                            <i class="bi bi-info-circle text-primary me-2"></i>
                            <span class="fw-semibold">Tournament Tie-Breaking Rules</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </button>
                    </div>
                    <div class="${collapsePanelClass}" id="${tieBreakerCollapseId}">
                        <div class="card-body small pt-0">
                            <p class="mb-2 text-muted">When teams have equal points, ranking is determined by the following criteria in order:</p>
                            <ol class="mb-2 ps-3">
                                <li><strong>Points</strong> - Total points earned (3 for win, 1 for draw, 0 for loss)</li>
                                <li><strong>Goal Difference (GD)</strong> - Goals scored minus goals conceded</li>
                                <li><strong>Goals For (GF)</strong> - Total goals scored</li>
                                <li><strong>Goals Against (GA)</strong> - Total goals conceded (lower is better)</li>
                                <li><strong>Head-to-Head Record</strong> - Direct comparison between tied teams using mini-table</li>
                            </ol>
                            <div class="mt-2">
                                <h6 class="mb-1 text-primary">Head-to-Head Mini-Table Process:</h6>
                                <ul class="mb-2 ps-3">
                                    <li>Extract matches between tied teams only</li>
                                    <li>Recompute points, GD, GF, GA using only those results</li>
                                    <li>Apply the same ranking criteria to the mini-table</li>
                                    <li>If still tied, use deterministic fallback (alphabetical order)</li>
                                </ul>
                            </div>
                            <p class="mb-0 text-muted"><small>These rules follow standard tournament regulations used in major football competitions and ensure deterministic, repeatable standings.</small></p>
                        </div>
                    </div>
                </div>
            </div>`;

        activateTooltips();

        if (wasExpanded && window.bootstrap?.Collapse) {
            const collapseElement = document.getElementById(tieBreakerCollapseId);
            if (collapseElement) {
                new window.bootstrap.Collapse(collapseElement, { toggle: false });
            }
        }
    };

    const renderMatches = (matches) => {
        if (!matchesContainer) {
            return;
        }

        if (!matches || matches.length === 0) {
            matchesContainer.innerHTML = '<p class="text-muted">Matches will appear once scheduling is complete.</p>';
            return;
        }

        let body = "";
        matches
            .slice()
            .sort((a, b) => (a.round - b.round) || (new Date(a.scheduledKickoff).getTime() - new Date(b.scheduledKickoff).getTime()))
            .forEach((match) => {
                const homeName = teamNames.get(match.homeTeamId) ?? match.homeTeamId;
                const awayName = teamNames.get(match.awayTeamId) ?? match.awayTeamId;
                const score = match.homeScore != null && match.awayScore != null ? `${match.homeScore} - ${match.awayScore}` : "&mdash;";
                body += `
                    <tr>
                        <td>${match.round}</td>
                        <td><span class="team-name" title="${homeName}">${homeName}</span></td>
                        <td><span class="team-name" title="${awayName}">${awayName}</span></td>
                        <td>${score}</td>
                    </tr>`;
            });

        matchesContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Round</th>
                            <th scope="col">Home</th>
                            <th scope="col">Away</th>
                            <th scope="col">Score</th>
                        </tr>
                    </thead>
                    <tbody>${body}</tbody>
                </table>
            </div>`;
    };

    const buildHeaders = (correlationId) => {
        const headers = new Headers({
            Accept: "application/json"
        });

        if (correlationId) {
            headers.set("X-Correlation-Id", correlationId);
        }

        return headers;
    };

    const parseProblemDetails = async (response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/problem+json")) {
            try {
                return await response.json();
            } catch (error) {
                return null;
            }
        }

        return null;
    };

    const handleHttpError = async (response, retry) => {
        const problem = await parseProblemDetails(response);
        if (problem) {
            const title = problem.title ?? "Request failed";
            const detail = problem.detail ?? "See logs for details.";
            showAlert(`${title}: ${detail}`, response.status >= 500 ? "danger" : "warning", retry);
        } else {
            showAlert(`Request failed with status ${response.status}.`, response.status >= 500 ? "danger" : "warning", retry);
        }
    };

    const handleNetworkError = (error, retry) => {
        console.error(error);
        showAlert("Network error while contacting the API.", "danger", retry);
    };

    const fetchStandings = async (correlationId) => {
        const response = await fetch(`/groups/${groupId}/standings`, { headers: buildHeaders(correlationId) });
        if (!response.ok) {
            await handleHttpError(response, () => fetchStandings(correlationId));
            throw createHandledError("Standings request failed.");
        }

        const data = await response.json();
        renderStandings(data.rows ?? []);
        return data.rows ?? [];
    };

    const fetchMatches = async (correlationId) => {
        const response = await fetch(`/groups/${groupId}/matches`, { headers: buildHeaders(correlationId) });
        if (!response.ok) {
            await handleHttpError(response, () => fetchMatches(correlationId));
            throw createHandledError("Matches request failed.");
        }

        const data = await response.json();
        renderMatches(data.matches ?? []);
        return data.matches ?? [];
    };

    const refresh = async (correlationId) => {
        hideAlert();
        setLoading(true);
        try {
            const [rows, matches] = await Promise.all([
                fetchStandings(correlationId),
                fetchMatches(correlationId)
            ]);
            ensureTeamNames(rows);
            renderMatches(matches);
        } catch (error) {
            if (error && error.handled) {
                return;
            }

            handleNetworkError(error, () => refresh(correlationId));
        } finally {
            setLoading(false);
        }
    };



    const generateCorrelationId = () => {
        if (window.crypto && window.crypto.randomUUID) {
            return window.crypto.randomUUID();
        }

        let template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return template.replace(/[xy]/g, (character) => {
            const random = (Math.random() * 16) | 0;
            const value = character === "x" ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    };

    const simulate = async () => {
        hideAlert();
        const correlationId = generateCorrelationId();

        setLoading(true);
        try {
            const response = await fetch(`/groups/${groupId}/simulate?iterations=1`, {
                method: "POST",
                headers: buildHeaders(correlationId)
            });

            if (!response.ok) {
                await handleHttpError(response, () => simulate());
                return;
            }

            await response.json();
            showAlert("Simulation completed successfully!", "success");
            await refresh(correlationId);
        } catch (error) {
            handleNetworkError(error, () => simulate());
        } finally {
            setLoading(false);
        }
    };

    const reset = async () => {
        hideAlert();
        const correlationId = generateCorrelationId();

        setLoading(true);
        try {
            const response = await fetch(`/groups/${groupId}/reset`, {
                method: "POST",
                headers: buildHeaders(correlationId)
            });

            if (!response.ok) {
                await handleHttpError(response, () => reset());
                return;
            }

            await response.json();
            showAlert("Group reset successfully!", "success");
            await refresh(correlationId);
        } catch (error) {
            handleNetworkError(error, () => reset());
        } finally {
            setLoading(false);
        }
    };

    if (alertRetryButton) {
        alertRetryButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (typeof retryHandler === "function") {
                hideAlert();
                retryHandler();
            }
        });
    }

    if (simulateOnceButton) {
        simulateOnceButton.addEventListener("click", (event) => {
            event.preventDefault();
            simulate();
        });
    }

    if (resetButton) {
        resetButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (confirm("Are you sure you want to reset all matches? This will clear all results.")) {
                reset();
            }
        });
    }

    if (refreshButton) {
        refreshButton.addEventListener("click", (event) => {
            event.preventDefault();
            refresh();
        });
    }

    renderStandings(state.standings ?? []);
    renderMatches(state.matches ?? []);
    activateTooltips();
})();
