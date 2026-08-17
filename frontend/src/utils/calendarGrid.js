// Builds a 6-week (42-day) grid for a given month, including the trailing
// days of the previous month and leading days of the next, matching the
// spec's "adjacent months rendered muted grey" requirement.
export const getMonthGrid = (year, monthIndex) => {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday

  const gridStart = new Date(year, monthIndex, 1 - startWeekday);

  const days = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    days.push({
      date,
      isCurrentMonth: date.getMonth() === monthIndex,
    });
  }
  return days;
};

// Sunday-start week containing `date`, as 7 Date objects.
export const getWeekDays = (date) => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Does `date` fall within [startDate, endDate] (inclusive, ignoring time)?
export const isWithinRange = (date, startDate, endDate) => {
  const d = stripTime(date);
  const s = stripTime(new Date(startDate));
  const e = stripTime(new Date(endDate));
  return d >= s && d <= e;
};

const stripTime = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addMonths = (date, delta) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
};

export const addDaysTo = (date, delta) => {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
};

export const monthLabel = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

export const dayLabel = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
