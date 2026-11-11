import { MODULE_WINDOWS } from "./data.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function buildBatchModuleSchedule(courses, batchStartDate) {
  const offset = batchStartDate
    ? Math.round((utcDate(batchStartDate) - utcDate(MODULE_WINDOWS[0][0])) / DAY_MS)
    : 0;

  return courses.flatMap((course) => {
    const window = MODULE_WINDOWS[course.id - 1];
    if (!window) return [];
    const start = utcDate(window[0]);
    const end = utcDate(window[1]);
    start.setUTCDate(start.getUTCDate() + offset);
    end.setUTCDate(end.getUTCDate() + offset);
    return [{ ...course, startDate: dateKey(start), endDate: dateKey(end) }];
  });
}

export function getWeekStart(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

export function getWeekDates(weekStart) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
