const STORAGE_KEY = "classly-schedule";

function createStarterClasses() {
  const now = new Date();
  const firstClass = new Date(now.getTime() + 45 * 60 * 1000);
  firstClass.setSeconds(0, 0);
  const secondClass = new Date(firstClass.getTime() + 2 * 60 * 60 * 1000);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  return [
    { id: crypto.randomUUID(), name: "Creative thinking", instructor: "Maya Chen", startsAt: firstClass.toISOString(), duration: 60 },
    { id: crypto.randomUUID(), name: "Introduction to design", instructor: "Jordan Lee", startsAt: secondClass.toISOString(), duration: 45 },
    { id: crypto.randomUUID(), name: "The art of storytelling", instructor: "Sam Rivera", startsAt: tomorrow.toISOString(), duration: 60 },
  ];
}

function isValidClass(item) {
  return item
    && typeof item.id === "string"
    && typeof item.name === "string"
    && typeof item.startsAt === "string"
    && Number.isFinite(new Date(item.startsAt).getTime())
    && Number.isFinite(Number(item.duration))
    && Number(item.duration) > 0;
}

export function loadClasses() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      const starterClasses = createStarterClasses();
      saveClasses(starterClasses);
      return starterClasses;
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error("Saved class schedule must be a list.");
    }
    return parsed.filter(isValidClass);
  } catch (error) {
    console.error("Could not load the saved class schedule.", error);
    return [];
  }
}

export function saveClasses(classes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error("Could not save the class schedule.", error);
    throw new Error("Your browser could not save this schedule. Check available storage and try again.");
  }
}

export function getUpcomingClasses(classes, now = new Date()) {
  return classes
    .map((item) => ({ ...item, startDate: new Date(item.startsAt) }))
    .filter((item) => item.startDate.getTime() + Number(item.duration) * 60_000 > now.getTime())
    .sort((a, b) => a.startDate - b.startDate);
}

export function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDate(date, options = { weekday: "short", month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

export function dateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function timeInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(11, 16);
}

export function createClass({ name, instructor, date, time, duration }) {
  const startsAt = new Date(`${date}T${time}`);
  if (!name.trim() || !date || !time || !Number.isFinite(startsAt.getTime())) {
    throw new Error("Enter a class name, valid date, and start time.");
  }
  if (startsAt.getTime() + Number(duration) * 60_000 <= Date.now()) {
    throw new Error("Choose a start time that has not already passed.");
  }

  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    instructor: instructor.trim(),
    startsAt: startsAt.toISOString(),
    duration: Number(duration),
  };
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours}h ${remainder}m`;
  if (hours) return `${hours}h`;
  return `${remainder}m`;
}
