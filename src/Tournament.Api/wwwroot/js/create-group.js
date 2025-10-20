(() => {
    "use strict";

    const form = document.querySelector("form.needs-validation");
    if (!form) {
        return;
    }

    const alertElement = document.getElementById("global-alert");
    const alertTextElement = document.getElementById("global-alert-text");
    const alertRetryButton = document.getElementById("global-alert-retry");

    const hideAlert = () => {
        if (!alertElement) {
            return;
        }

        alertElement.hidden = true;
        alertElement.classList.remove("show");
        alertTextElement.textContent = "";
        alertRetryButton.classList.add("d-none");
    };

    const showAlert = (message) => {
        if (!alertElement) {
            return;
        }

        alertElement.classList.remove("alert-warning", "alert-info", "alert-success");
        alertElement.classList.add("alert-danger");
        alertTextElement.textContent = message;
        alertRetryButton.classList.add("d-none");
        alertElement.hidden = false;
        alertElement.classList.add("show");
    };

    const getTeamInputs = () => {
        const nameElements = Array.from(form.querySelectorAll("[data-team-name]"));
        const strengthElements = Array.from(form.querySelectorAll("[data-team-strength]"));
        return nameElements.map((element, index) => ({
            nameElement: element,
            strengthElement: strengthElements[index]
        }));
    };

    form.addEventListener("input", hideAlert);

    form.addEventListener("submit", (event) => {
        hideAlert();

        const teamInputs = getTeamInputs();
        const names = teamInputs.map(({ nameElement }) => nameElement.value.trim()).filter(Boolean);
        const strengths = teamInputs.map(({ strengthElement }) => Number.parseFloat(strengthElement.value));

        if (names.length !== 4) {
            event.preventDefault();
            event.stopPropagation();
            showAlert("Exactly four teams are required.");
            return;
        }

        if (new Set(names.map((value) => value.toLowerCase())).size !== names.length) {
            event.preventDefault();
            event.stopPropagation();
            showAlert("Team names must be unique.");
            return;
        }

        if (strengths.some((value) => Number.isNaN(value) || value <= 0)) {
            event.preventDefault();
            event.stopPropagation();
            showAlert("Each team strength must be greater than zero.");
        }
    });
})();
