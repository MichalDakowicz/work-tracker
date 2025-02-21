// Dark mode functionality
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

// Initialize dark mode
const darkMode = localStorage.getItem("darkMode");
if (darkMode === "enabled") {
    body.classList.add("dark-mode");
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", toggleDarkMode);

// Work tracker functionality
let workDays = JSON.parse(localStorage.getItem("workDays")) || [];
let paychecks = JSON.parse(localStorage.getItem("paychecks")) || [];

// DOM elements
const dateInput = document.querySelector("#date");
const hoursInput = document.querySelector("#hours");
const minutesInput = document.querySelector("#minutes");
const paycheckDateInput = document.querySelector("#paycheck-date");
const addDayButton = document.querySelector("#add-day-button");
const addPaycheckButton = document.querySelector("#add-paycheck-button");
const dayList = document.querySelector("#day-list");
const totalTimeElement = document.querySelector("#total-time");
const timeFromLastPaycheck = document.querySelector("#time-from-last-paycheck");

// Add timeRangesInput to DOM elements
const timeRangesInput = document.querySelector("#time-ranges");

// Update DOM elements
const dayInput = document.querySelector("#day");
const monthInput = document.querySelector("#month");
const yearInput = document.querySelector("#year");
const paycheckDayInput = document.querySelector("#paycheck-day");
const paycheckMonthInput = document.querySelector("#paycheck-month");
const paycheckYearInput = document.querySelector("#paycheck-year");

// New DOM elements for time range input system
const startTimeInput = document.querySelector("#start-time");
const endTimeInput = document.querySelector("#end-time");
const addRangeButton = document.querySelector("#add-range");
const rangesList = document.querySelector("#ranges-list");

let currentRanges = [];

// Helper functions
function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
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
    const relevantDays = workDays.filter(
        (day) => new Date(day.date) > lastPaycheck
    );
    return calculateTotalTime(relevantDays);
}

function formatDisplayDate(dateString) {
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
}

function calculateTimeForPeriod(startDate, endDate) {
    const periodDays = workDays.filter(day => {
        const dayDate = new Date(day.date);
        return (!startDate || dayDate > startDate) && (!endDate || dayDate <= endDate);
    });
    return calculateTotalTime(periodDays);
}

function updateDisplay() {
    // Update total time
    const totalMinutes = calculateTotalTime(workDays);
    totalTimeElement.textContent = `Total Time: ${formatTime(totalMinutes)}`;

    // Update time from last paycheck
    const minutesFromLastPaycheck = calculateTimeFromLastPaycheck();
    timeFromLastPaycheck.textContent = `Time Since Last Paycheck: ${formatTime(
        minutesFromLastPaycheck
    )}`;

    // Update day list with paychecks as separators
    dayList.innerHTML = "";
    let sortedPaychecks = [...paychecks].sort();
    let lastPaycheckDate = null;

    workDays
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((day) => {
            // Add paycheck separators before their respective days
            while (sortedPaychecks.length > 0 && sortedPaychecks[0] <= day.date) {
                const paycheckDate = sortedPaychecks.shift();
                const periodMinutes = calculateTimeForPeriod(lastPaycheckDate, new Date(paycheckDate));
                const separator = document.createElement("div");
                separator.className = "paycheck-separator";
                separator.innerHTML = `
                    <span class="date">💰 Paycheck ${formatDisplayDate(paycheckDate)}</span>
                    <span class="total">Period total: ${formatTime(periodMinutes)}</span>
                `;
                dayList.appendChild(separator);
                lastPaycheckDate = new Date(paycheckDate);
            }

            // Add the work day
            const dayElement = document.createElement("div");
            const timeRangesHtml = day.timeRanges
                ? `<span class="time-ranges-display">${day.timeRanges}</span>`
                : "";
            dayElement.innerHTML = `
                <span>
                    ${formatDisplayDate(day.date)}: ${day.hours}h ${day.minutes}m
                    ${timeRangesHtml}
                </span>
                <button onclick="deleteDay('${day.date}')" class="delete-button">
                    <img src="delete.svg" alt="Delete" />
                </button>
            `;
            dayList.appendChild(dayElement);
        });

    // Add final paycheck separator if any remaining
    while (sortedPaychecks.length > 0) {
        const paycheckDate = sortedPaychecks.shift();
        const periodMinutes = calculateTimeForPeriod(lastPaycheckDate, new Date(paycheckDate));
        const separator = document.createElement("div");
        separator.className = "paycheck-separator";
        separator.innerHTML = `
            <span class="date">💰 Paycheck ${formatDisplayDate(paycheckDate)}</span>
            <span class="total">Period total: ${formatTime(periodMinutes)}</span>
        `;
        dayList.appendChild(separator);
        lastPaycheckDate = new Date(paycheckDate);
    }
}

// Event handlers
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
    const start = startTimeInput.value;
    const end = endTimeInput.value;

    if (!start || !end) return;

    currentRanges.push(`${start}-${end}`);
    updateRangesList();

    // Reset inputs
    startTimeInput.value = "";
    endTimeInput.value = "";
}

function removeTimeRange(index) {
    currentRanges.splice(index, 1);
    updateRangesList();
}

function updateRangesList() {
    rangesList.innerHTML = "";
    currentRanges.forEach((range, index) => {
        const rangeElement = document.createElement("div");
        rangeElement.className = "range-item";
        rangeElement.innerHTML = `
            <span>${range}</span>
            <button onclick="removeTimeRange(${index})" class="delete-button">
                <img src="delete.svg" alt="Delete" />
            </button>
        `;
        rangesList.appendChild(rangeElement);
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

    workDays = workDays.filter((d) => d.date !== date);
    workDays.push({ date, hours, minutes, timeRanges });
    saveToLocalStorage();
    updateDisplay();

    // Reset inputs
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

    if (!day || !month || !year) return;
    if (day < 1 || day > 31 || month < 1 || month > 12) return;

    const date = formatDateString(day, month, year);
    paychecks.push(date);
    saveToLocalStorage();
    updateDisplay();

    // Reset inputs
    paycheckDayInput.value = "";
    paycheckMonthInput.value = "";
    paycheckYearInput.value = "";
}

function deleteDay(date) {
    workDays = workDays.filter((day) => day.date !== date);
    saveToLocalStorage();
    updateDisplay();
}

// Initialize date input with current date
function setCurrentDate() {
    const today = new Date();
    dayInput.value = today.getDate();
    monthInput.value = today.getMonth() + 1;
    yearInput.value = today.getFullYear();
}

// Initialize display
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

// Event listeners
addDayButton.addEventListener("click", addDay);
addPaycheckButton.addEventListener("click", addPaycheck);
addRangeButton.addEventListener("click", addTimeRange);

function handleTimeInput(e) {
    if (e.target.value.length === 5) {
        // HH:MM format
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

startTimeInput.addEventListener("input", handleTimeInput);
endTimeInput.addEventListener("input", handleTimeInput);
startTimeInput.addEventListener("keypress", handleTimeKeypress);
endTimeInput.addEventListener("keypress", handleTimeKeypress);

// Initialize display
document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    updateDisplay();
});

updateDisplay();
