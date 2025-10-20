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
    const statusPanel = document.getElementById("simulation-status-panel");
    const statusTextElement = document.getElementById("simulation-status-text");
    const statusFootnoteElement = document.getElementById("simulation-status-footnote");
    const simulateOnceButton = document.getElementById("simulate-once");
    const simulateManyButton = document.getElementById("simulate-many");
    const refreshButton = document.getElementById("refresh");
    const iterationsInput = document.getElementById("iterations-input");
    const alertElement = document.getElementById("global-alert");
    const alertTextElement = document.getElementById("global-alert-text");
    const alertRetryButton = document.getElementById("global-alert-retry");

    const teamNames = new Map(Object.entries(state.teamNames ?? {}));
    let latestStatus = state.simulationStatus ?? null;
    let retryHandler = null;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const createHandledError = (message) => {
        const error = new Error(message);
        error.handled = true;
        return error;
    };

    const formatDuration = (seconds) => {
        if (!Number.isFinite(seconds) || seconds <= 0) {
            return null;
        }

        if (seconds < 1) {
            return "<1s";
        }

        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);

        if (minutes < 60) {
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours < 24) {
            const parts = [`${hours}h`];
            if (remainingMinutes > 0) {
                parts.push(`${remainingMinutes}m`);
            }

            if (remainingSeconds > 0) {
                parts.push(`${remainingSeconds}s`);
            }

            return parts.join(" ");
        }

        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        const parts = [`${days}d`];

        if (remainingHours > 0) {
            parts.push(`${remainingHours}h`);
        }

        if (remainingMinutes > 0) {
            parts.push(`${remainingMinutes}m`);
        }

        return parts.join(" ");
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) {
            return null;
        }

        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
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

        [simulateOnceButton, simulateManyButton, refreshButton, iterationsInput].forEach((element) => {
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

    const renderSimulationStatus = (status) => {
        latestStatus = status ?? null;

        if (!statusPanel || !statusTextElement || !statusFootnoteElement) {
            return;
        }

        if (!status || status.state === "idle") {
            statusPanel.classList.add("d-none");
            statusTextElement.textContent = "";
            statusFootnoteElement.textContent = "";
            return;
        }

        statusPanel.classList.remove("alert-info", "alert-success", "alert-warning", "alert-danger", "d-none");

        const tone = status.state === "completed" ? "alert-success" : status.state === "queued" ? "alert-warning" : "alert-info";
        statusPanel.classList.add(tone);

        const message = status.explanation || `Simulation ${status.state}.`;
        statusTextElement.textContent = message;

        const parts = [];

        if (Number.isFinite(status.matchesCompleted) && Number.isFinite(status.matchesTotal)) {
            parts.push(`${status.matchesCompleted}/${status.matchesTotal} matches processed`);
        }

        if (Number.isFinite(status.estimatedSecondsRemaining) && status.state !== "completed") {
            const formatted = formatDuration(status.estimatedSecondsRemaining);
            if (formatted) {
                parts.push(`~${formatted} remaining`);
            }
        }

        if (status.lastUpdatedAt) {
            const formattedTime = formatTimestamp(status.lastUpdatedAt);
            if (formattedTime) {
                parts.push(`updated ${formattedTime}`);
            }
        }

        statusFootnoteElement.textContent = parts.join(" · ");
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
            <div class="small text-muted mt-2">
                <button class="btn btn-link btn-sm p-0 align-baseline" type="button" data-bs-toggle="tooltip" data-bs-title="Points → GD → GF → GA → Head-to-Head">
                    Tie-breaker rules
                </button>
            </div>`;

        activateTooltips();
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

    const fetchSimulationStatus = async (correlationId) => {
        const response = await fetch(`/groups/${groupId}/simulation-status`, { headers: buildHeaders(correlationId) });
        if (!response.ok) {
            await handleHttpError(response, () => fetchSimulationStatus(correlationId));
            throw createHandledError("Simulation status request failed.");
        }

        const data = await response.json();
        renderSimulationStatus(data);
        return data;
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
            await fetchSimulationStatus(correlationId);
        } catch (error) {
            if (error && error.handled) {
                return;
            }

            handleNetworkError(error, () => refresh(correlationId));
        } finally {
            setLoading(false);
        }
    };

    const pollMatches = async (correlationId, iterations) => {
        const normalizedIterations = Number.isFinite(iterations) && iterations > 0 ? iterations : 1;
        const baseTimeout = 10000;
        const perIterationBuffer = 40;
        const timeoutAt = Date.now() + Math.min(60000, baseTimeout + (normalizedIterations - 1) * perIterationBuffer);
        while (Date.now() < timeoutAt) {
            try {
                const [matches, status] = await Promise.all([
                    fetchMatches(correlationId),
                    fetchSimulationStatus(correlationId)
                ]);
                const finished = matches.length >= 6 && matches.every((match) => match.homeScore != null && match.awayScore != null);
                const statusCompleted = !status || status.state === "completed" || status.state === "idle";
                if (finished && statusCompleted) {
                    return true;
                }
            } catch (error) {
                if (error && error.handled) {
                    return false;
                }

                handleNetworkError(error, () => pollMatches(correlationId, iterations));
                return false;
            }

            await delay(normalizedIterations >= 50 ? 600 : 400);
        }

        return false;
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

    const simulate = async (iterations) => {
        hideAlert();
        const parsedIterations = Number.parseInt(iterations, 10);
        if (Number.isNaN(parsedIterations) || parsedIterations < 1 || parsedIterations > 1000) {
            showAlert("Iterations must be between 1 and 1000.", "warning");
            return;
        }

        const correlationId = generateCorrelationId();

        setLoading(true);
        try {
            const response = await fetch(`/groups/${groupId}/simulate?iterations=${parsedIterations}`, {
                method: "POST",
                headers: buildHeaders(correlationId)
            });

            if (!response.ok) {
                await handleHttpError(response, () => simulate(parsedIterations));
                return;
            }

            await response.json();
            await fetchSimulationStatus(correlationId);

            const completed = await pollMatches(correlationId, parsedIterations);
            if (!completed) {
                showAlert("Simulation is still running. Try refreshing shortly.", "info", () => refresh(correlationId));
                await refresh(correlationId);
                return;
            }

            await refresh(correlationId);
        } catch (error) {
            handleNetworkError(error, () => simulate(parsedIterations));
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
            simulate(1);
        });
    }

    if (simulateManyButton) {
        simulateManyButton.addEventListener("click", (event) => {
            event.preventDefault();
            simulate(iterationsInput?.value ?? "1");
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
    renderSimulationStatus(latestStatus);
    activateTooltips();
})();
