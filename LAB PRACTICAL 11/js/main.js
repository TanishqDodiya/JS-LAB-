import {
  createClass,
  dateInputValue,
  formatDate,
  formatDuration,
  formatTime,
  getUpcomingClasses,
  isSameDay,
  loadClasses,
  saveClasses,
  timeInputValue,
} from "./scheduler.js";
import { formatCountdown, startCountdown } from "./timer.js";

const elements = {
  currentDate: document.querySelector("#current-date"),
  greeting: document.querySelector("#greeting"),
  classCount: document.querySelector("#class-count"),
  todayCount: document.querySelector("#today-count"),
  learningHours: document.querySelector("#learning-hours"),
  todayLabel: document.querySelector("#today-label"),
  upcomingCount: document.querySelector("#upcoming-count"),
  scheduleList: document.querySelector("#schedule-list"),
  emptyState: document.querySelector("#empty-state"),
  filter: document.querySelector("#schedule-filter"),
  nextDate: document.querySelector("#next-date"),
  nextSubject: document.querySelector("#next-subject"),
  nextHeading: document.querySelector("#countdown-heading"),
  nextMeta: document.querySelector("#next-meta"),
  countdownCaption: document.querySelector("#countdown-caption"),
  countdown: document.querySelector("#countdown"),
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  dialog: document.querySelector("#class-dialog"),
  form: document.querySelector("#class-form"),
  formError: document.querySelector("#form-error"),
  toast: document.querySelector("#toast"),
};

let classes = loadClasses();
let toastTimeout;

function announce(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove("visible"), 3500);
}

function saveAndRender(message) {
  try {
    saveClasses(classes);
    render();
    if (message) announce(message);
  } catch (error) {
    classes = loadClasses();
    render();
    elements.formError.textContent = error.message;
  }
}

function renderDate() {
  const now = new Date();
  elements.currentDate.textContent = formatDate(now, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const hour = now.getHours();
  elements.greeting.textContent = hour < 12 ? "GOOD MORNING, STUDENT" : hour < 17 ? "GOOD AFTERNOON, STUDENT" : "GOOD EVENING, STUDENT";
}

function renderSummary(upcoming, now) {
  const todayClasses = upcoming.filter((item) => isSameDay(item.startDate, now));
  const totalMinutes = todayClasses.reduce((total, item) => total + Number(item.duration), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  elements.classCount.textContent = String(upcoming.length);
  elements.todayCount.textContent = String(todayClasses.length);
  elements.learningHours.textContent = hours ? `${hours}h${minutes ? ` ${minutes}m` : ""}` : `${minutes}m`;
  elements.todayLabel.textContent = todayClasses.length === 1 ? "One class to look forward to" : todayClasses.length ? "A good day to learn" : "A little room to recharge";
  elements.upcomingCount.textContent = String(upcoming.length);
}

function createClassRow(item, now) {
  const row = document.createElement("article");
  row.className = "class-row";

  const time = document.createElement("div");
  time.className = "class-time";
  const timeLabel = document.createElement("strong");
  timeLabel.textContent = formatTime(item.startDate);
  const dateLabel = document.createElement("span");
  dateLabel.textContent = isSameDay(item.startDate, now) ? "Today" : formatDate(item.startDate, { month: "short", day: "numeric" });
  time.append(timeLabel, dateLabel);

  const details = document.createElement("div");
  details.className = "class-details";
  const name = document.createElement("strong");
  name.textContent = item.name;
  const instructor = document.createElement("span");
  instructor.textContent = item.instructor ? `with ${item.instructor}` : "Class session";
  details.append(name, instructor);

  const badge = document.createElement("span");
  badge.className = `class-badge${isSameDay(item.startDate, now) ? " today" : ""}`;
  badge.textContent = isSameDay(item.startDate, now) ? "Today" : formatDate(item.startDate, { weekday: "short" });

  const actions = document.createElement("div");
  actions.className = "class-row-actions";
  const duration = document.createElement("span");
  duration.className = "duration-label";
  duration.textContent = formatDuration(Number(item.duration));
  const remove = document.createElement("button");
  remove.className = "remove-class";
  remove.type = "button";
  remove.setAttribute("aria-label", `Remove ${item.name}`);
  remove.title = "Remove class";
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    classes = classes.filter((classItem) => classItem.id !== item.id);
    saveAndRender("Class removed from your schedule.");
  });
  actions.append(duration, remove);
  row.append(time, details, badge, actions);
  return row;
}

function renderSchedule(upcoming, now) {
  const filter = elements.filter.value;
  const visibleClasses = upcoming.filter((item) => {
    if (filter === "today") return isSameDay(item.startDate, now);
    if (filter === "upcoming") return !isSameDay(item.startDate, now);
    return true;
  });

  elements.scheduleList.replaceChildren(...visibleClasses.map((item) => createClassRow(item, now)));
  elements.scheduleList.hidden = visibleClasses.length === 0;
  elements.emptyState.hidden = visibleClasses.length > 0;
  const heading = elements.emptyState.querySelector("h3");
  const description = elements.emptyState.querySelector("p");
  if (upcoming.length === 0) {
    heading.textContent = "No classes here yet";
    description.textContent = "Add a class to start building your learning schedule.";
  } else {
    heading.textContent = filter === "today" ? "No classes scheduled today" : "No upcoming classes";
    description.textContent = "Try another filter or add a new class to your schedule.";
  }
}

function renderCountdown(upcoming, now) {
  const nextClass = upcoming[0];
  if (!nextClass) {
    elements.nextDate.textContent = "";
    elements.nextSubject.textContent = "No upcoming classes";
    elements.nextHeading.textContent = "You’re all caught up";
    elements.nextMeta.textContent = "";
    elements.countdownCaption.textContent = "Add a class whenever you’re ready for what’s next.";
    elements.countdown.setAttribute("aria-label", "No upcoming classes");
    elements.days.textContent = "00";
    elements.hours.textContent = "00";
    elements.minutes.textContent = "00";
    elements.seconds.textContent = "00";
    return;
  }

  elements.nextDate.textContent = formatDate(nextClass.startDate, { weekday: "short", month: "short", day: "numeric" });
  elements.nextSubject.textContent = nextClass.name;
  const isInProgress = nextClass.startDate.getTime() <= now.getTime();
  elements.nextHeading.textContent = isInProgress
    ? "Class in progress"
    : isSameDay(nextClass.startDate, now) ? "Coming up today" : "Your next class";
  elements.nextMeta.textContent = `${formatTime(nextClass.startDate)}${nextClass.instructor ? ` · with ${nextClass.instructor}` : ""}`;
  elements.countdown.setAttribute("aria-label", isInProgress ? `${nextClass.name} is in progress` : `Time until ${nextClass.name}`);
  const parts = formatCountdown(nextClass.startDate.getTime() - now.getTime());
  elements.days.textContent = parts.days;
  elements.hours.textContent = parts.hours;
  elements.minutes.textContent = parts.minutes;
  elements.seconds.textContent = parts.seconds;
  elements.countdownCaption.textContent = isInProgress
    ? "You’re in a class right now. Enjoy your session!"
    : isSameDay(nextClass.startDate, now)
      ? "Your next learning moment is getting closer."
      : `Get ready for ${formatDate(nextClass.startDate, { weekday: "long" })}.`;
}

function render() {
  const now = new Date();
  const upcoming = getUpcomingClasses(classes, now);
  renderDate();
  renderSummary(upcoming, now);
  renderCountdown(upcoming, now);
  renderSchedule(upcoming, now);
}

function openDialog() {
  elements.form.reset();
  elements.formError.textContent = "";
  const defaultStart = new Date(Date.now() + 60 * 60 * 1000);
  defaultStart.setMinutes(Math.ceil(defaultStart.getMinutes() / 15) * 15, 0, 0);
  elements.form.elements.date.value = dateInputValue(defaultStart);
  elements.form.elements.time.value = timeInputValue(defaultStart);
  elements.dialog.showModal();
  elements.form.elements.name.focus();
}

document.querySelector("#open-class-form").addEventListener("click", openDialog);
document.querySelector("#empty-add-class").addEventListener("click", openDialog);
document.querySelector("#close-dialog").addEventListener("click", () => elements.dialog.close());
elements.filter.addEventListener("change", render);

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  elements.formError.textContent = "";
  const formData = new FormData(elements.form);

  try {
    const newClass = createClass({
      name: String(formData.get("name") ?? ""),
      instructor: String(formData.get("instructor") ?? ""),
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? ""),
      duration: String(formData.get("duration") ?? ""),
    });
    classes = [...classes, newClass];
    saveClasses(classes);
    elements.dialog.close();
    render();
    announce("Your new class is on the schedule.");
  } catch (error) {
    elements.formError.textContent = error.message;
  }
});

elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) elements.dialog.close();
});

render();
startCountdown({
  getTarget: () => getUpcomingClasses(classes)[0]?.startDate ?? null,
  onTick: ({ target, started } = {}) => {
    if (!target) return;
    const upcoming = getUpcomingClasses(classes);
    renderCountdown(upcoming, new Date());
    if (started) {
      const startedClass = classes.find((item) => new Date(item.startsAt).getTime() === target.getTime());
      announce(`${startedClass?.name ?? "Your class"} is starting now. Have a great session!`);
    }
  },
});
setInterval(render, 60_000);
