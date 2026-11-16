import {
  DAYS,
  findNextClass,
  formatDate,
  formatTime,
  getClassEnd,
  loadSchedule,
  saveSchedule,
  sortClasses,
} from "./scheduler.js";

const schedule = loadSchedule();
const today = new Date();
let selectedDay = today.getDay();
let toastTimeout;

const elements = {
  clock: document.querySelector("#live-clock"),
  todayLabel: document.querySelector("#today-label"),
  dayPicker: document.querySelector("#day-picker"),
  selectedDayHeading: document.querySelector("#selected-day-heading"),
  classCount: document.querySelector("#class-count"),
  classList: document.querySelector("#class-list"),
  nextStatus: document.querySelector("#next-status"),
  nextClassName: document.querySelector("#next-class-name"),
  nextClassDetails: document.querySelector("#next-class-details"),
  countdownCaption: document.querySelector("#countdown-caption"),
  countdown: document.querySelector("#countdown"),
  countdownDays: document.querySelector("#countdown-days"),
  countdownHours: document.querySelector("#countdown-hours"),
  countdownMinutes: document.querySelector("#countdown-minutes"),
  countdownSeconds: document.querySelector("#countdown-seconds"),
  dialog: document.querySelector("#class-dialog"),
  form: document.querySelector("#class-form"),
  formError: document.querySelector("#form-error"),
  toast: document.querySelector("#toast"),
};

const pad = (value) => String(value).padStart(2, "0");

function updateClock(now) {
  elements.clock.textContent = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  elements.todayLabel.textContent = formatDate(now, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).toUpperCase();
}

function renderDayPicker(now = new Date()) {
  const weekStart = new Date(now);
  const mondayOffset = (now.getDay() + 6) % 7;
  weekStart.setDate(now.getDate() - mondayOffset);

  elements.dayPicker.replaceChildren(
    ...DAYS.map((day) => {
      const date = new Date(weekStart);
      const offset = day.value === 0 ? 6 : day.value - 1;
      date.setDate(weekStart.getDate() + offset);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "day-button";
      button.setAttribute("aria-pressed", String(day.value === selectedDay));
      if (day.value === now.getDay()) button.classList.add("is-today");
      if (day.value === selectedDay) button.classList.add("is-selected");
      button.innerHTML = `<span class="day-name">${day.short}</span><span class="day-date">${date.getDate()}</span>`;
      button.addEventListener("click", () => {
        selectedDay = day.value;
        renderDayPicker(now);
        renderSchedule(now);
      });
      return button;
    }),
  );
}

function getClassStatus(classItem, now) {
  if (selectedDay !== now.getDay()) return { label: "Scheduled", live: false };
  const start = new Date(now);
  const [hours, minutes] = classItem.time.split(":").map(Number);
  start.setHours(hours, minutes, 0, 0);
  const end = getClassEnd(classItem, start);

  if (now >= start && now < end) return { label: "In progress", live: true };
  if (start > now) return { label: "Upcoming", live: false };
  return { label: "Completed", live: false };
}

function renderSchedule(now = new Date()) {
  const day = DAYS.find((item) => item.value === selectedDay);
  const classes = sortClasses(schedule.filter((item) => item.day === selectedDay));
  elements.selectedDayHeading.textContent =
    selectedDay === now.getDay() ? "Today’s classes" : `${day.name}’s classes`;
  elements.classCount.textContent = `${classes.length} ${classes.length === 1 ? "class" : "classes"}`;

  if (classes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const message = document.createElement("strong");
    message.textContent = "A little breathing room.";
    const hint = document.createElement("span");
    hint.textContent = "No classes scheduled for this day. Add one whenever you’re ready.";
    empty.append(message, hint);
    elements.classList.replaceChildren(empty);
    return;
  }

  const items = classes.map((classItem) => {
    const article = document.createElement("article");
    article.className = "class-item";
    const time = document.createElement("div");
    time.className = "class-time";
    time.textContent = formatTime(classItem.time);

    const info = document.createElement("div");
    info.className = "class-info";
    const name = document.createElement("h4");
    name.textContent = classItem.name;
    const details = document.createElement("p");
    details.textContent = `${classItem.location || "Room not set"} · ${classItem.duration} min`;
    info.append(name, details);

    const status = getClassStatus(classItem, now);
    const actions = document.createElement("div");
    actions.className = "class-actions";
    const tag = document.createElement("span");
    tag.className = `class-tag${status.live ? " is-live" : ""}`;
    tag.textContent = status.label;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete-button";
    remove.setAttribute("aria-label", `Remove ${classItem.name}`);
    remove.title = "Remove class";
    remove.textContent = "×";
    remove.addEventListener("click", () => removeClass(classItem.id));
    actions.append(tag, remove);

    article.append(time, info, actions);
    return article;
  });
  elements.classList.replaceChildren(...items);
}

function renderCountdown(now = new Date()) {
  const { active, next } = findNextClass(schedule, now);
  const featured = active || next;

  if (!featured) {
    elements.nextStatus.textContent = "All clear";
    elements.nextClassName.textContent = "No classes scheduled";
    elements.nextClassDetails.textContent = "Add a class to see it here";
    elements.countdownCaption.textContent = "NOTHING ON THE CALENDAR";
    elements.countdown.replaceChildren();
    return;
  }

  elements.countdown.replaceChildren(
    ...[
      ["days", elements.countdownDays],
      ["hours", elements.countdownHours],
      ["minutes", elements.countdownMinutes],
      ["seconds", elements.countdownSeconds],
    ].flatMap(([unit, node], index) => {
      const fragment = [node.parentElement];
      if (index < 3) {
        const separator = document.createElement("i");
        separator.textContent = ":";
        fragment.push(separator);
      }
      return fragment;
    }),
  );

  elements.nextStatus.textContent = active ? "In progress" : "Coming up";
  elements.nextClassName.textContent = featured.classItem.name;

  if (active) {
    const remaining = Math.max(0, Math.ceil((active.end - now) / 1000));
    elements.nextClassDetails.textContent = `${formatTime(featured.classItem.time)} · ${featured.classItem.location || "Room not set"}`;
    elements.countdownCaption.textContent = "CLASS ENDS IN";
    updateCountdown(remaining);
    return;
  }

  const difference = Math.max(0, Math.ceil((next.start - now) / 1000));
  const dayLabel = formatDate(next.start, { weekday: "long" });
  const dateLabel = formatDate(next.start, { month: "short", day: "numeric" });
  elements.nextClassDetails.textContent =
    `${dayLabel}, ${dateLabel} · ${formatTime(featured.classItem.time)} · ${featured.classItem.location || "Room not set"}`;
  elements.countdownCaption.textContent = "STARTS IN";
  updateCountdown(difference);
}

function updateCountdown(totalSeconds) {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  elements.countdownDays.textContent = pad(days);
  elements.countdownHours.textContent = pad(hours);
  elements.countdownMinutes.textContent = pad(minutes);
  elements.countdownSeconds.textContent = pad(seconds);
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
}

function removeClass(id) {
  const index = schedule.findIndex((item) => item.id === id);
  if (index === -1) return;
  const [removed] = schedule.splice(index, 1);
  try {
    saveSchedule(schedule);
    renderAll();
    showToast(`${removed.name} removed from your schedule.`);
  } catch (error) {
    schedule.splice(index, 0, removed);
    renderAll();
    showToast(error.message);
  }
}

function renderAll(now = new Date()) {
  updateClock(now);
  renderDayPicker(now);
  renderSchedule(now);
  renderCountdown(now);
}

document.querySelector("#open-form").addEventListener("click", () => {
  elements.formError.textContent = "";
  elements.dialog.showModal();
  elements.form.elements.name.focus();
});

document.querySelector("#close-form").addEventListener("click", () => elements.dialog.close());

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  elements.formError.textContent = "";
  const formData = new FormData(elements.form);
  const classItem = {
    id: crypto.randomUUID(),
    name: String(formData.get("name")).trim(),
    day: Number(formData.get("day")),
    time: String(formData.get("time")),
    duration: Number(formData.get("duration")),
    location: String(formData.get("location")).trim(),
  };

  if (!classItem.name || !DAYS.some((day) => day.value === classItem.day) || !classItem.time) {
    elements.formError.textContent = "Please enter a class name, day, and valid start time.";
    return;
  }

  schedule.push(classItem);
  try {
    saveSchedule(schedule);
  } catch (error) {
    schedule.pop();
    elements.formError.textContent = error.message;
    return;
  }
  selectedDay = classItem.day;
  elements.form.reset();
  elements.dialog.close();
  renderAll();
  showToast(`${classItem.name} added to your schedule.`);
});

renderAll();
window.setInterval(() => {
  const now = new Date();
  updateClock(now);
  renderSchedule(now);
  renderCountdown(now);
}, 1000);
window.setInterval(() => {
  renderDayPicker(new Date());
}, 60_000);
