const STORAGE_KEY = "classday-schedule-v1";

export const DAYS = [
  { value: 1, short: "MON", name: "Monday" },
  { value: 2, short: "TUE", name: "Tuesday" },
  { value: 3, short: "WED", name: "Wednesday" },
  { value: 4, short: "THU", name: "Thursday" },
  { value: 5, short: "FRI", name: "Friday" },
  { value: 6, short: "SAT", name: "Saturday" },
  { value: 0, short: "SUN", name: "Sunday" },
];

const SAMPLE_CLASSES = [
  { id: "sample-1", name: "Design Fundamentals", day: 1, time: "09:30", duration: 60, location: "Studio 204" },
  { id: "sample-2", name: "Introduction to Psychology", day: 1, time: "13:00", duration: 90, location: "Hall B" },
  { id: "sample-3", name: "Web Development", day: 2, time: "10:00", duration: 90, location: "Lab 3" },
  { id: "sample-4", name: "Creative Writing", day: 3, time: "11:00", duration: 60, location: "Room 118" },
  { id: "sample-5", name: "Data & Society", day: 4, time: "09:00", duration: 60, location: "Lecture Hall 2" },
  { id: "sample-6", name: "Visual Communication", day: 5, time: "14:30", duration: 90, location: "Studio 204" },
];

function isValidClass(item) {
  return (
    item !== null &&
    typeof item === "object" &&
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    Number.isInteger(item.day) &&
    item.day >= 0 &&
    item.day <= 6 &&
    typeof item.time === "string" &&
    /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time) &&
    Number.isFinite(item.duration) &&
    item.duration > 0 &&
    typeof item.location === "string"
  );
}

export function loadSchedule() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [...SAMPLE_CLASSES];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isValidClass)) {
      console.error("Saved schedule has an invalid format; using the sample schedule.");
      return [...SAMPLE_CLASSES];
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Could not read the saved class schedule.", error);
      return [...SAMPLE_CLASSES];
    }
    if (error instanceof DOMException && error.name === "SecurityError") {
      console.error("Browser storage is unavailable; using the sample schedule.", error);
      return [...SAMPLE_CLASSES];
    }
    throw error;
  }
}

export function saveSchedule(schedule) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  } catch (error) {
    console.error("Could not save your class schedule.", error);
    throw new Error("Your browser could not save this change. Check your storage settings and try again.");
  }
}

export function sortClasses(schedule) {
  return [...schedule].sort((a, b) => a.time.localeCompare(b.time) || a.name.localeCompare(b.name));
}

export function getClassStart(classItem, referenceDate = new Date()) {
  const date = new Date(referenceDate);
  const daysUntil = (classItem.day - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntil);
  const [hours, minutes] = classItem.time.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);

  if (date <= referenceDate) date.setDate(date.getDate() + 7);
  return date;
}

export function getClassEnd(classItem, start) {
  return new Date(start.getTime() + classItem.duration * 60_000);
}

export function findNextClass(schedule, now = new Date()) {
  let next = null;
  let active = null;

  for (const classItem of schedule) {
    for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
      const start = new Date(now);
      start.setDate(now.getDate() + dayOffset);
      if (start.getDay() !== classItem.day) continue;

      const [hours, minutes] = classItem.time.split(":").map(Number);
      start.setHours(hours, minutes, 0, 0);
      const end = getClassEnd(classItem, start);
      if (start <= now && now < end && (!active || start < active.start)) {
        active = { classItem, start, end };
      } else if (start > now && (!next || start < next.start)) {
        next = { classItem, start };
      }
    }
  }

  return { active, next };
}

export function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat(undefined, options).format(date);
}
