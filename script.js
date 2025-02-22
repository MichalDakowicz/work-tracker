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

let currentRanges = [];

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
    const relevantDays = workDays.filter((day) => {
        const dayStart = new Date(day.date + "T00:00:00");
        return dayStart > lastPaycheck;
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
    const periodDays = workDays.filter((day) => {
        const dayDate = new Date(day.date);
        return (
            (!startDate || dayDate > startDate) &&
            (!endDate || dayDate <= endDate)
        );
    });
    return calculateTotalTime(periodDays);
}

function updateDisplay() {
    const totalMinutes = calculateTotalTime(workDays);
    totalTimeElement.textContent = `Total Time: ${formatTime(totalMinutes)}`;

    const minutesFromLastPaycheck = calculateTimeFromLastPaycheck();
    timeFromLastPaycheck.textContent = `Since Paycheck: ${formatTime(
        minutesFromLastPaycheck
    )}`;

    dayList.innerHTML = "";
    let sortedPaychecks = [...paychecks].sort();
    let lastPaycheckDate = null;

    workDays
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach((day) => {
            const dayElement = document.createElement("div");
            const timeRangesHtml = day.timeRanges
                ? `<span class="time-ranges-display">${day.timeRanges}</span>`
                : "";
            dayElement.innerHTML = `
                <span>
                    ${formatDisplayDate(day.date)}: ${day.hours}h ${
                day.minutes
            }m
                    ${timeRangesHtml}
                </span>
                <button onclick="deleteDay('${
                    day.date
                }')" class="delete-button">
                    <img src="delete.svg" alt="Delete" />
                </button>
            `;
            dayList.appendChild(dayElement);

            while (sortedPaychecks.length > 0) {
                const paycheckDateTime = new Date(sortedPaychecks[0]);
                const currentDayEnd = new Date(day.date + "T23:59:59");

                if (paycheckDateTime > currentDayEnd) break;

                const paycheckDate = sortedPaychecks.shift();
                const periodMinutes = calculateTimeForPeriod(
                    lastPaycheckDate,
                    paycheckDateTime
                );

                const time = paycheckDate.split("T")[1];
                const separator = document.createElement("div");
                separator.className = "paycheck-separator";
                separator.innerHTML = `
                    <div class="info">
                        <span class="date">💰 ${
                            time === "23:00" ? "Night" : "Morning"
                        } Paycheck ${formatDisplayDate(
                    paycheckDate.split("T")[0]
                )}</span>
                        <span class="total">Period total: ${formatTime(
                            periodMinutes
                        )}</span>
                    </div>
                    <button onclick="deletePaycheck('${paycheckDate}')" class="delete-paycheck" title="Delete paycheck">
                        <img src="delete.svg" alt="Delete" />
                    </button>
                `;
                dayList.appendChild(separator);
                lastPaycheckDate = paycheckDateTime;
            }
        });

    while (sortedPaychecks.length > 0) {
        const paycheckDate = sortedPaychecks.shift();
        const paycheckDateTime = new Date(paycheckDate);
        const periodMinutes = calculateTimeForPeriod(
            lastPaycheckDate,
            paycheckDateTime
        );
        const time = paycheckDate.split("T")[1];
        const separator = document.createElement("div");
        separator.className = "paycheck-separator";
        separator.innerHTML = `
            <div class="info">
                <span class="date">💰 ${
                    time === "23:00" ? "Night" : "Morning"
                } Paycheck ${formatDisplayDate(
            paycheckDate.split("T")[0]
        )}</span>
                <span class="total">Period total: ${formatTime(
                    periodMinutes
                )}</span>
            </div>
            <button onclick="deletePaycheck('${paycheckDate}')" class="delete-paycheck" title="Delete paycheck">
                <img src="delete.svg" alt="Delete" />
            </button>
        `;
        dayList.appendChild(separator);
        lastPaycheckDate = paycheckDateTime;
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
    const time = document.querySelector(
        'input[name="paycheck-time"]:checked'
    ).value;

    if (!day || !month || !year) return;
    if (day < 1 || day > 31 || month < 1 || month > 12) return;

    const date = formatDateString(day, month, year);
    const fullDateTime = `${date}T${time}`;

    paychecks.push(fullDateTime);
    saveToLocalStorage();
    updateDisplay();

    paycheckDayInput.value = "";
    paycheckMonthInput.value = "";
    paycheckYearInput.value = "";
}

function deleteDay(date) {
    workDays = workDays.filter((day) => day.date !== date);
    saveToLocalStorage();
    updateDisplay();
}

function deletePaycheck(date) {
    paychecks = paychecks.filter((paycheck) => paycheck !== date);
    saveToLocalStorage();
    updateDisplay();
}

function setCurrentDate() {
    const today = new Date();
    dayInput.value = today.getDate();
    monthInput.value = today.getMonth() + 1;
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

function initializeEventListeners() {
    const numberInputs = [
        startHoursInput,
        startMinutesInput,
        endHoursInput,
        endMinutesInput,
        dayInput,
        monthInput,
        paycheckDayInput,
        paycheckMonthInput,
    ];

    numberInputs.forEach((input) => {
        input.addEventListener("input", handleNumberInput);
    });

    addDayButton.addEventListener("click", addDay);
    addPaycheckButton.addEventListener("click", addPaycheck);
    addRangeButton.addEventListener("click", addTimeRange);
    dayInput.addEventListener("blur", handleDayMonthBlur);
    monthInput.addEventListener("blur", handleDayMonthBlur);
    paycheckDayInput.addEventListener("blur", handleDayMonthBlur);
    paycheckMonthInput.addEventListener("blur", handleDayMonthBlur);
}

function handleDayMonthBlur(e) {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length === 1) {
        e.target.value = val.padStart(2, "0");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setCurrentDate();
    initializeEventListeners();
    updateDisplay();
});

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
    let value = input.value;
    
    value = value.replace(/[^\d]/g, '');
    
    const numValue = parseInt(value) || 0;
    if (input.id.includes('hours') && numValue > 23) {
        value = '23';
    } else if (input.id.includes('minutes') && numValue > 59) {
        value = '59';
    } else if (input.id.includes('month') && numValue > 12) {
        value = '12';
    } else if (input.id.includes('day') && numValue > 31) {
        value = '31';
    }

    input.value = value;

    if (value.length >= 2) {
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
            else if (input === paycheckYearInput) {
                const radio = document.querySelector(
                    'input[name="paycheck-time"]'
                );
                if (radio) radio.focus();
            }
        });
    }
}

window.deletePaycheck = deletePaycheck;

updateDisplay();
