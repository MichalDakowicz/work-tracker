const darkModeToggle = document.querySelector("#dark-mode-toggle");
const body = document.body;

function toggleDarkMode(event) {
    if (event.target.checked) {
        body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        body.classList.remove("dark-mode");
        localStorage.removeItem("darkMode");
    }
}

const darkMode = localStorage.getItem("darkMode");
if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", toggleDarkMode);

let workDays = JSON.parse(localStorage.getItem("workDays")) || [];
let paychecks = JSON.parse(localStorage.getItem("paychecks")) || [];

const dateInput = document.querySelector("#date");
const hoursInput = document.querySelector("#hours");
const minutesInput = document.querySelector("#minutes");
const paycheckDateInput = document.querySelector("#paycheck-date");
const addDayButton = document.querySelector("#add-day-button");
const addPaycheckButton = document.querySelector("#add-paycheck-button");
const dayList = document.querySelector("#day-list");
const totalTimeElement = document.querySelector("#total-time");
const timeFromLastPaycheck = document.querySelector("#time-from-last-paycheck");

const timeRangesInput = document.querySelector("#time-ranges");

const dayInput = document.querySelector("#day");
const monthInput = document.querySelector("#month");
const yearInput = document.querySelector("#year");
const paycheckDayInput = document.querySelector("#paycheck-day");
const paycheckMonthInput = document.querySelector("#paycheck-month");
const paycheckYearInput = document.querySelector("#paycheck-year");

const addRangeButton = document.querySelector("#add-range");
const rangesList = document.querySelector("#ranges-list");

const startHoursInput = document.querySelector("#start-hours");
const startMinutesInput = document.querySelector("#start-minutes");
const endHoursInput = document.querySelector("#end-hours");
const endMinutesInput = document.querySelector("#end-minutes");

const paycheckHoursInput = document.querySelector("#paycheck-hours");
const paycheckMinutesInput = document.querySelector("#paycheck-minutes");

let currentRanges = [];

let currentLanguage = localStorage.getItem("language") || "en";

const translations = {
    en: {
        "darkMode": "Dark Mode",
        "exportData": "Export Data",
        "importData": "Import Data",
        
        "totalTime": "Total Time",
        "sincePaycheck": "Since Paycheck",
        "addRange": "Add Range",
        "add": "Add",
        "update": "Update",
        "cancelEdit": "Cancel Edit",
        "addPaycheck": "Add paycheck",
        "paycheck": "Paycheck",
        
        "day": "Day",
        "month": "Month",
        "year": "Year",
        "to": "to",
        
        "deleteDay": "Delete this day record?",
        "deletePaycheck": "Delete this paycheck record?",
        "yes": "Yes",
        "no": "No",
        
        "at": "at",
        "periodTotal": "Period total",
        "paycheckReport": "Paycheck Report",
        "workDaysInPeriod": "Work Days in this Period:",
        "noWorkDays": "No work days recorded in this period."
    },
    pl: {
        "darkMode": "Tryb ciemny",
        "exportData": "Eksport danych",
        "importData": "Import danych",
        
        "totalTime": "Całkowity czas",
        "sincePaycheck": "Od wypłaty",
        "addRange": "Dodaj zakres",
        "add": "Dodaj",
        "update": "Aktualizuj",
        "cancelEdit": "Anuluj edycję",
        "addPaycheck": "Dodaj wypłatę",
        "paycheck": "Wypłata",
        
        "day": "Dzień",
        "month": "Miesiąc",
        "year": "Rok",
        "to": "do",
        
        "deleteDay": "Usunąć ten dzień pracy?",
        "deletePaycheck": "Usunąć tę wypłatę?",
        "yes": "Tak",
        "no": "Nie",
        
        "at": "o",
        "periodTotal": "Suma okresu",
        "paycheckReport": "Raport wypłaty",
        "workDaysInPeriod": "Dni pracy w tym okresie:",
        "noWorkDays": "Brak dni pracy w tym okresie."
    }
};

function t(key) {
    return translations[currentLanguage][key] || key;
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("language", lang);
    
    document.getElementById("dark-mode-label").textContent = t("darkMode");
    document.getElementById("export-data").innerHTML = `<img src="img/export.svg" alt="Export" />${t("exportData")}`;
    document.getElementById("import-trigger").innerHTML = `<img src="img/import.svg" alt="Import" />${t("importData")}`;
    
    document.getElementById("add-range").innerHTML = `<img src="img/add.svg" />${t("addRange")}`;
    
    const addDayBtn = document.getElementById("add-day-button");
    addDayBtn.innerHTML = `<img src="img/add.svg" />${addDayBtn.textContent.includes("Update") ? t("update") : t("add")}`;
    
    const cancelEditBtn = document.getElementById("cancel-edit-button");
    if (cancelEditBtn) {
        cancelEditBtn.textContent = t("cancelEdit");
    }
    
    document.getElementById("add-paycheck-button").innerHTML = `<img src="img/add.svg" />${t("addPaycheck")}`;
    
    dayInput.placeholder = t("day");
    monthInput.placeholder = t("month");
    yearInput.placeholder = t("year");
    paycheckDayInput.placeholder = t("day");
    paycheckMonthInput.placeholder = t("month");
    paycheckYearInput.placeholder = t("year");
    
    document.querySelectorAll(".time-pair span").forEach(span => {
        if (span.textContent.toLowerCase() === "to" || span.textContent.toLowerCase() === "do") {
            span.textContent = t("to");
        }
    });
    
    document.getElementById("confirm-yes").textContent = t("yes");
    document.getElementById("confirm-no").textContent = t("no");
    
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.id === `lang-${lang}`);
    });
    
    updateDisplay();
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (currentLanguage === "pl") {
        const hourLabel = hours === 1 ? "godz" : "godz";
        const minuteLabel = minutes === 1 ? "min" : "min";
        return `${hours}${hourLabel} ${minutes}${minuteLabel}`;
    } else {
        return `${hours}h ${minutes}m`;
    }
}

function saveToLocalStorage() {
    localStorage.setItem("workDays", JSON.stringify(workDays));
    localStorage.setItem("paychecks", JSON.stringify(paychecks));
}

function calculateTotalTime(days) {
    return days.reduce(
        (total, day) => total + (day.hours * 60 + day.minutes),
        0
    );
}

function calculateTimeFromLastPaycheck() {
    if (paychecks.length === 0) return calculateTotalTime(workDays);

    const lastPaycheck = new Date(paychecks[paychecks.length - 1]);

    const relevantDays = workDays
        .filter((day) => {
            if (!day.timeRanges) return false;

            const ranges = day.timeRanges.split(",").map((r) => r.trim());
            return ranges.some((range) => {
                const [start] = range.split("-").map((t) => t.trim());
                const workStart = new Date(day.date + "T" + start);
                return workStart > lastPaycheck;
            });
        })
        .map((day) => {
            const ranges = day.timeRanges.split(",").map((r) => r.trim());
            const validRanges = ranges.filter((range) => {
                const [start] = range.split("-").map((t) => t.trim());
                const workStart = new Date(day.date + "T" + start);
                return workStart > lastPaycheck;
            });

            return {
                ...day,
                timeRanges: validRanges.join(", "),
            };
        });

    return calculateTotalTime(relevantDays);
}

function formatDisplayDate(dateString) {
    const [datePart, timePart] = dateString.split("T");
    const [year, month, day] = datePart.split("-");
    const timeStr = timePart ? ` ${timePart}` : "";
    return `${day}-${month}-${year}${timeStr}`;
}

function calculateTimeForPeriod(startDate, endDate) {
    if (!startDate && endDate) {
        const cutoff = new Date(endDate);
        cutoff.setHours(23, 59, 59, 999);
        const periodDays = workDays.filter(
            (day) => new Date(day.date) <= cutoff
        );
        return calculateTotalTime(periodDays);
    }
    const periodDays = workDays.filter((day) => {
        if (!day.timeRanges) return false;
        const ranges = day.timeRanges.split(",").map((r) => r.trim());
        return ranges.some((range) => {
            const [start] = range.split("-");
            const workDateTime = new Date(day.date + "T" + start.trim());
            return (
                (!startDate || workDateTime > startDate) &&
                (!endDate || workDateTime <= endDate)
            );
        });
    });
    return calculateTotalTime(periodDays);
}

let editMode = false;
let editingDate = null;

function getEventDateTime(ev) {
    if (ev.type === "work") {
        if (ev.timeRanges) {
            const ranges = ev.timeRanges
                .split(",")
                .map((r) => r.trim())
                .filter(Boolean);
            if (ranges.length > 0) {
                const startTimes = ranges.map((r) => r.split("-")[0]);
                startTimes.sort();
                return new Date(ev.date + "T" + startTimes[0]);
            }
        }
        return new Date(ev.date + "T00:00");
    }
    if (ev.type === "paycheck") {
        return new Date(ev.fullDate);
    }
    return new Date(ev.date + "T00:00");
}

function updateDisplay() {
    const totalMinutes = calculateTotalTime(workDays);
    totalTimeElement.textContent = `${t("totalTime")}: ${formatTime(totalMinutes)}`;

    const minutesFromLastPaycheck = calculateTimeFromLastPaycheck();
    timeFromLastPaycheck.textContent = `${t("sincePaycheck")}: ${formatTime(
        minutesFromLastPaycheck
    )}`;

    const workEvents = workDays.map((d) => ({
        ...d,
        type: "work",
        fullDate: d.date + "T00:00",
    }));
    const paycheckEvents = paychecks.map((p) => {
        const [date, time] = p.split("T");
        return { date, time, fullDate: p, type: "paycheck" };
    });
    const events = [...workEvents, ...paycheckEvents].sort((a, b) => {
        return getEventDateTime(a) - getEventDateTime(b);
    });

    dayList.innerHTML = "";
    let lastPaycheckDate = null;

    events.forEach((ev) => {
        if (ev.type === "work") {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day-item");
            dayElement.setAttribute("tabindex", 0);
            dayElement.dataset.date = ev.date;
            const timeRangesHtml = ev.timeRanges
                ? `<span class="time-ranges-display">${ev.timeRanges}</span>`
                : "";
            dayElement.innerHTML = `
                <span>
                    ${formatDisplayDate(ev.date)}: ${ev.hours}h ${ev.minutes}m
                    ${timeRangesHtml}
                </span>
                <div class="action-buttons">
                    <button onclick="editDay('${
                        ev.date
                    }')" class="delete-button edit-button">
                        <img src="img/edit.svg" alt="Edit" />
                    </button>
                    <button onclick="deleteDay('${
                        ev.date
                    }')" class="delete-button">
                        <img src="img/delete.svg" alt="Delete" />
                    </button>
                </div>
            `;
            dayList.appendChild(dayElement);
        } else if (ev.type === "paycheck") {
            const paycheckDateTime = getEventDateTime(ev);
            const periodMinutes = calculateTimeForPeriod(
                lastPaycheckDate,
                paycheckDateTime
            );
            const separator = document.createElement("div");
            separator.className = "paycheck-separator";
            separator.innerHTML = `
                    <div class="info">
                        <span class="date">💰 ${t("paycheck")} ${formatDisplayDate(
                            ev.date
                        )} ${t("at")} ${ev.time}</span>
                        <span class="total">${t("periodTotal")}: ${formatTime(
                            periodMinutes
                        )}</span>
                    </div>
                    <div class="paycheck-actions">
                        <button onclick="savePaycheckAsImage('${
                            ev.fullDate
                        }')" class="save-paycheck-image" title="${currentLanguage === 'pl' ? 'Zapisz jako obrazek' : 'Save as image'}">
                            <img src="img/save.svg" alt="${currentLanguage === 'pl' ? 'Zapisz jako obrazek' : 'Save as image'}" />
                        </button>
                        <button onclick="deletePaycheck('${
                            ev.fullDate
                        }')" class="delete-paycheck" title="${currentLanguage === 'pl' ? 'Usuń wypłatę' : 'Delete paycheck'}">
                            <img src="img/delete.svg" alt="${currentLanguage === 'pl' ? 'Usuń' : 'Delete'}" />
                        </button>
                    </div>
                `;
            dayList.appendChild(separator);
            lastPaycheckDate = paycheckDateTime;
        }
    });
}

document.addEventListener("keydown", function (e) {
    if (e.key === "Delete") {
        const focused = document.activeElement;
        if (
            focused &&
            focused.classList.contains("day-item") &&
            focused.dataset.date
        ) {
            deleteDay(focused.dataset.date);
            e.preventDefault();
        }
    }
});

function editDay(date) {
    const record = workDays.find((d) => d.date === date);
    if (record) {
        editMode = true;
        editingDate = date;
        const parts = date.split("-");
        yearInput.value = parts[0];
        monthInput.value = parts[1];
        dayInput.value = parts[2];
        currentRanges = record.timeRanges.split(", ").filter(Boolean);
        updateRangesList();
        addDayButton.textContent = t("update");
        if (!document.getElementById("cancel-edit-button")) {
            const cancelBtn = document.createElement("button");
            cancelBtn.id = "cancel-edit-button";
            cancelBtn.textContent = t("cancelEdit");
            cancelBtn.addEventListener("click", cancelEdit);
            addDayButton.parentNode.appendChild(cancelBtn);
        }
        document
            .getElementById("add-day")
            .scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function cancelEdit() {
    editMode = false;
    editingDate = null;
    dayInput.value = "";
    monthInput.value = "";
    yearInput.value = "";
    currentRanges = [];
    updateRangesList();
    addDayButton.textContent = t("add");
    const cancelBtn = document.getElementById("cancel-edit-button");
    if (cancelBtn) {
        cancelBtn.remove();
    }
}

function calculateTimeFromRanges(timeRanges) {
    if (!timeRanges) return 0;

    const ranges = timeRanges.split(",").map((range) => range.trim());
    let totalMinutes = 0;

    for (const range of ranges) {
        const [start, end] = range.split("-").map((time) => time.trim());
        if (!start || !end) continue;

        const [startHour, startMin] = start
            .split(":")
            .map((num) => parseInt(num));
        const [endHour, endMin] = end.split(":").map((num) => parseInt(num));

        if (
            isNaN(startHour) ||
            isNaN(startMin) ||
            isNaN(endHour) ||
            isNaN(endMin)
        )
            continue;

        const startInMinutes = startHour * 60 + startMin;
        const endInMinutes = endHour * 60 + endMin;

        totalMinutes += endInMinutes - startInMinutes;
    }

    return totalMinutes;
}

function addTimeRange() {
    const startHours = startHoursInput.value.padStart(2, "0");
    const startMinutes = startMinutesInput.value.padStart(2, "0");
    const endHours = endHoursInput.value.padStart(2, "0");
    const endMinutes = endMinutesInput.value.padStart(2, "0");

    if (!startHours || !startMinutes || !endHours || !endMinutes) return;

    const start = `${startHours}:${startMinutes}`;
    const end = `${endHours}:${endMinutes}`;

    currentRanges.push(`${start}-${end}`);
    updateRangesList();

    startHoursInput.value = "";
    startMinutesInput.value = "";
    endHoursInput.value = "";
    endMinutesInput.value = "";
    startHoursInput.focus();
}

function removeTimeRange(index) {
    currentRanges.splice(index, 1);
    updateRangesList();
    const prev = lastFocusedInput
        ? getPreviousInput(lastFocusedInput)
        : startHoursInput;
    prev.focus();
}

function updateRangesList() {
    rangesList.innerHTML = "";
    currentRanges.forEach((range, index) => {
        const rangeElement = document.createElement("div");
        rangeElement.className = "range-item";
        rangeElement.innerHTML = `
            <span>${range}</span>
            <button onclick="removeTimeRange(${index})" class="delete-button">
                <img src="img/delete.svg" alt="Delete" />
            </button>
        `;
        rangesList.appendChild(rangeElement);
    });
}

function sortTimeRanges(ranges) {
    return ranges.sort((a, b) => {
        const [startA] = a.split("-").map((time) => {
            const [hours, minutes] = time.trim().split(":").map(Number);
            return hours * 60 + minutes;
        });
        const [startB] = b.split("-").map((time) => {
            const [hours, minutes] = time.trim().split(":").map(Number);
            return hours * 60 + minutes;
        });
        return startA - startB;
    });
}

function addDay() {
    const day = parseInt(dayInput.value);
    const month = parseInt(monthInput.value);
    const year = parseInt(yearInput.value);
    const timeRanges = currentRanges.join(", ");

    if (!day || !month || !year || currentRanges.length === 0) return;
    if (day < 1 || day > 31 || month < 1 || month > 12) return;

    const totalMinutes = calculateTimeFromRanges(timeRanges);
    if (totalMinutes <= 0) return;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const date = formatDateString(day, month, year);

    if (editMode && editingDate === date) {
        const index = workDays.findIndex((d) => d.date === date);
        if (index !== -1) {
            workDays[index] = {
                date,
                hours,
                minutes,
                timeRanges: timeRanges,
            };
        }
        cancelEdit();
    } else {
        const existingDayIndex = workDays.findIndex((d) => d.date === date);
        if (existingDayIndex !== -1) {
            const existingDay = workDays[existingDayIndex];
            const existingRanges = existingDay.timeRanges.split(", ");
            const newRanges = [...existingRanges, ...currentRanges];
            const sortedRanges = sortTimeRanges(newRanges);
            const timeRangesString = sortedRanges.join(", ");
            const totalNewMinutes = calculateTimeFromRanges(timeRangesString);
            const newHours = Math.floor(totalNewMinutes / 60);
            const newMinutes = totalNewMinutes % 60;
            workDays[existingDayIndex] = {
                date,
                hours: newHours,
                minutes: newMinutes,
                timeRanges: timeRangesString,
            };
        } else {
            const sortedRanges = sortTimeRanges(currentRanges);
            const timeRangesString = sortedRanges.join(", ");
            workDays.push({
                date,
                hours,
                minutes,
                timeRanges: timeRangesString,
            });
        }
    }

    saveToLocalStorage();
    updateDisplay();

    dayInput.value = "";
    monthInput.value = "";
    yearInput.value = "";
    currentRanges = [];
    updateRangesList();
}

function addPaycheck() {
    const day = parseInt(paycheckDayInput.value);
    const month = parseInt(paycheckMonthInput.value);
    const year = parseInt(paycheckYearInput.value);
    const hours = paycheckHoursInput.value.padStart(2, "0");
    const minutes = paycheckMinutesInput.value.padStart(2, "0");

    if (!day || !month || !year || !hours || !minutes) return;
    if (day < 1 || day > 31 || month < 1 || month > 12) return;

    const date = formatDateString(day, month, year);
    const fullDateTime = `${date}T${hours}:${minutes}`;

    paychecks.push(fullDateTime);
    saveToLocalStorage();
    updateDisplay();

    paycheckDayInput.value = "";
    paycheckMonthInput.value = "";
    paycheckYearInput.value = "";
    paycheckHoursInput.value = "";
    paycheckMinutesInput.value = "";
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    const msgEl = document.getElementById("confirm-message");
    const yesBtn = document.getElementById("confirm-yes");
    const noBtn = document.getElementById("confirm-no");

    msgEl.textContent = message;
    yesBtn.textContent = t("yes");
    noBtn.textContent = t("no");
    
    modal.style.display = "flex";

    function modalClickHandler(e) {
        if (e.target === modal) {
            cleanUp();
        }
    }
    modal.addEventListener("click", modalClickHandler);

    const cleanUp = () => {
        modal.style.display = "none";
        yesBtn.removeEventListener("click", confirmHandler);
        noBtn.removeEventListener("click", cancelHandler);
        modal.removeEventListener("click", modalClickHandler);
    };

    function confirmHandler() {
        cleanUp();
        onConfirm();
    }

    function cancelHandler() {
        cleanUp();
    }

    yesBtn.addEventListener("click", confirmHandler);
    noBtn.addEventListener("click", cancelHandler);
}

function deleteDay(date) {
    showConfirmModal(t("deleteDay"), function () {
        workDays = workDays.filter((day) => day.date !== date);
        saveToLocalStorage();
        updateDisplay();
        const prev = lastFocusedInput
            ? getPreviousInput(lastFocusedInput)
            : dayInput;
        prev.focus();
    });
}

function deletePaycheck(date) {
    showConfirmModal(t("deletePaycheck"), function () {
        paychecks = paychecks.filter((p) => p !== date);
        saveToLocalStorage();
        updateDisplay();
        const prev = lastFocusedInput
            ? getPreviousInput(lastFocusedInput)
            : paycheckDayInput;
        prev.focus();
    });
}

function setCurrentDate() {
    const today = new Date();
    dayInput.value = String(today.getDate()).padStart(2, "0");
    monthInput.value = String(today.getMonth() + 1).padStart(2, "0");
    yearInput.value = today.getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    updateDisplay();
});

function formatDateString(day, month, year) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
    )}`;
}

const inputOrder = [
    startHoursInput,
    startMinutesInput,
    endHoursInput,
    endMinutesInput,
    dayInput,
    monthInput,
    yearInput,
    paycheckDayInput,
    paycheckMonthInput,
    paycheckYearInput,
    paycheckHoursInput,
    paycheckMinutesInput,
];

function getPreviousInput(currentInput) {
    const index = inputOrder.indexOf(currentInput);
    if (index > 0) {
        return inputOrder[index - 1];
    }
    return inputOrder[0];
}

let lastFocusedInput = null;

const allInputs = document.querySelectorAll("input");
allInputs.forEach((input) => {
    input.addEventListener("focus", () => {
        lastFocusedInput = input;
    });
});

function initializeEventListeners() {
    const numberInputs = [
        startHoursInput,
        startMinutesInput,
        endHoursInput,
        endMinutesInput,
        dayInput,
        monthInput,
        yearInput,
        paycheckDayInput,
        paycheckMonthInput,
        paycheckYearInput,
        paycheckHoursInput,
        paycheckMinutesInput,
    ];

    numberInputs.forEach((input) => {
        input.addEventListener("input", handleNumberInput);
        input.addEventListener("keydown", handleBackspace);
    });

    addDayButton.addEventListener("click", addDay);
    addPaycheckButton.addEventListener("click", addPaycheck);
    addRangeButton.addEventListener("click", addTimeRange);
    dayInput.addEventListener("blur", handleDayMonthBlur);
    monthInput.addEventListener("blur", handleDayMonthBlur);
    paycheckDayInput.addEventListener("blur", handleDayMonthBlur);
    paycheckMonthInput.addEventListener("blur", handleDayMonthBlur);
}

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initializeEventListeners();
    updateDisplay();
});

function handleDayMonthBlur(e) {
    const val = e.target.value.replace(/\D/g, "");
    if (e.target.id === "year" || e.target.id === "paycheck-year") {
        if (val.length > 0 && val.length < 4) {
            e.target.value = val.padStart(4, "0");
        }
    } else {
        if (val.length === 1) {
            e.target.value = val.padStart(2, "0");
        }
    }
}

function handleTimeInput(e) {
    if (e.target.value.length === 5) {
        if (e.target.id === "start-time") {
            endTimeInput.focus();
        } else if (e.target.id === "end-time") {
            addRangeButton.focus();
        }
    }
}

function handleTimeKeypress(e) {
    if (e.key === "Enter") {
        if (e.target.id === "start-time" && !startTimeInput.value) {
            endTimeInput.focus();
        } else if (
            e.target.id === "end-time" ||
            (e.target.id === "start-time" && startTimeInput.value)
        ) {
            addTimeRange();
            startTimeInput.focus();
        }
    }
}

function handleNumberInput(e) {
    const input = e.target;
    let value = input.value.replace(/[^\d]/g, "");
    const numValue = parseInt(value) || 0;

    if (input.id.includes("hours") && numValue > 23) {
        value = "23";
    } else if (input.id.includes("minutes") && numValue > 59) {
        value = "59";
    } else if (input.id.includes("month") && numValue > 12) {
        value = "12";
    } else if (input.id.includes("day") && numValue > 31) {
        value = "31";
    }
    input.value = value;

    let advanceLength =
        input.id === "year" || input.id === "paycheck-year" ? 4 : 2;

    if (value.length >= advanceLength) {
        requestAnimationFrame(() => {
            if (input === startHoursInput) startMinutesInput.focus();
            else if (input === startMinutesInput) endHoursInput.focus();
            else if (input === endHoursInput) endMinutesInput.focus();
            else if (input === endMinutesInput) addRangeButton.focus();
            else if (input === dayInput) monthInput.focus();
            else if (input === monthInput) yearInput.focus();
            else if (input === yearInput) startHoursInput.focus();
            else if (input === paycheckDayInput) paycheckMonthInput.focus();
            else if (input === paycheckMonthInput) paycheckYearInput.focus();
            else if (input === paycheckYearInput) paycheckHoursInput.focus();
            else if (input === paycheckHoursInput) paycheckMinutesInput.focus();
        });
    }
}

function handleBackspace(e) {
    if (e.key === "Backspace" && e.target.value === "") {
        const prev = getPreviousInput(e.target);
        if (prev && prev !== e.target && prev.value.length > 0) {
            e.preventDefault();
            prev.value = prev.value.slice(0, -1);
            prev.focus();
        }
    }
}

window.deletePaycheck = deletePaycheck;

function exportData() {
    const data = { workDays, paychecks };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "work-tracker-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadHtml2Canvas() {
    return new Promise((resolve, reject) => {
        if (window.html2canvas) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load html2canvas library'));
        document.head.appendChild(script);
    });
}

function savePaycheckAsImage(paycheckDate) {
    loadHtml2Canvas().then(() => {
        const paycheckObj = paychecks.find(p => p === paycheckDate);
        if (!paycheckObj) return;
        
        const paycheckIndex = paychecks.indexOf(paycheckObj);
        const previousPaycheck = paycheckIndex > 0 ? paychecks[paycheckIndex - 1] : null;
        
        const paycheckDateTime = new Date(paycheckDate);
        const previousPaycheckDateTime = previousPaycheck ? new Date(previousPaycheck) : null;
        
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.padding = '20px';
        container.style.backgroundColor = body.classList.contains('dark-mode') ? '#333' : '#fff';
        container.style.color = body.classList.contains('dark-mode') ? '#fff' : '#333';
        container.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        
        const header = document.createElement('h2');
        const [date, time] = paycheckDate.split('T');
        header.textContent = `${formatDisplayDate(date)} ${t("at")} ${time}`;
        header.style.marginBottom = '20px';
        header.style.marginBlockStart = '0';
        header.style.fontFamily = '"Nunito Sans", sans-serif';
        container.appendChild(header);
        
        const periodMinutes = calculateTimeForPeriod(previousPaycheckDateTime, paycheckDateTime);
        
        const periodInfo = document.createElement('div');
        periodInfo.textContent = `${t("periodTotal")}: ${formatTime(periodMinutes)}`;
        periodInfo.style.fontFamily = '"Roboto Mono", monospace';
        periodInfo.style.fontSize = '1.2rem';
        periodInfo.style.padding = '10px';
        periodInfo.style.marginBottom = '20px';
        periodInfo.style.background = body.classList.contains('dark-mode') ? '#444' : '#f0f0f0';
        periodInfo.style.borderRadius = '4px';
        periodInfo.style.border = '1px solid ' + (body.classList.contains('dark-mode') ? '#555' : '#ddd');
        container.appendChild(periodInfo);
        
        const daysTitle = document.createElement('h3');
        daysTitle.style.marginBottom = '15px';
        daysTitle.style.fontFamily = '"Nunito Sans", sans-serif';
        container.appendChild(daysTitle);
        
        const daysList = document.createElement('div');
        daysList.style.display = 'flex';
        daysList.style.flexDirection = 'column';
        daysList.style.gap = '10px';
        
        const sortedWorkDays = [...workDays].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        const periodDays = sortedWorkDays.filter(day => {
            const workDate = new Date(day.date);
            return (!previousPaycheckDateTime || workDate > previousPaycheckDateTime) && 
                   workDate <= paycheckDateTime;
        });
        
        if (periodDays.length === 0) {
            const noData = document.createElement('p');
            noData.textContent = t("noWorkDays");
            noData.style.fontStyle = 'italic';
            noData.style.opacity = '0.7';
            daysList.appendChild(noData);
        } else {
            for (const day of periodDays) {
                const dayEl = document.createElement('div');
                dayEl.style.padding = '10px 15px';
                dayEl.style.border = '1px solid ' + (body.classList.contains('dark-mode') ? '#555' : '#ddd');
                dayEl.style.borderRadius = '6px';
                dayEl.style.background = body.classList.contains('dark-mode') ? '#444' : '#fff';
                
                const timeRangesHtml = day.timeRanges ? 
                    `<div style="font-family: 'Roboto Mono', monospace; font-size: 0.9em; margin-top: 5px; opacity: 0.7;">${day.timeRanges}</div>` : '';
                    
                dayEl.innerHTML = `
                    <div style="font-family: 'Roboto Mono', monospace;">
                        ${formatDisplayDate(day.date)}: ${day.hours}h ${day.minutes}m
                        ${timeRangesHtml}
                    </div>
                `;
                
                daysList.appendChild(dayEl);
            }
        }
        
        container.appendChild(daysList);
        document.body.appendChild(container);
        
        html2canvas(container, {
            backgroundColor: body.classList.contains('dark-mode') ? '#333' : '#fff'
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `paycheck-${date.replace(/-/g, '')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            document.body.removeChild(container);
        }).catch(error => {
            console.error("Error generating canvas:", error);
            alert("Failed to generate image: " + error.message);
            document.body.removeChild(container);
        });
    }).catch(error => {
        alert(currentLanguage === 'pl' ? 
              'Nie udało się załadować biblioteki html2canvas: ' + error.message : 
              'Failed to load html2canvas library: ' + error.message);
    });
}

window.savePaycheckAsImage = savePaycheckAsImage;

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.workDays && data.paychecks) {
                workDays = data.workDays;
                paychecks = data.paychecks;
                saveToLocalStorage();
                updateDisplay();
            } else {
                alert("Invalid data format.");
            }
        } catch (err) {
            alert("Failed to import data.");
        }
    };
    reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
    const exportBtn = document.getElementById("export-data");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportData);
    }
    
    const importInput = document.getElementById("import-data");
    if (importInput) {
        importInput.addEventListener("change", importData);
    }
    const importTrigger = document.getElementById("import-trigger");
    if (importTrigger) {
        importTrigger.addEventListener("click", () => {
            importInput.click();
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const langEnBtn = document.getElementById("lang-en");
    const langPlBtn = document.getElementById("lang-pl");
    
    langEnBtn.addEventListener("click", () => setLanguage("en"));
    langPlBtn.addEventListener("click", () => setLanguage("pl"));
    
    setLanguage(currentLanguage);
});

updateDisplay();
