// Minimal iCalendar (RFC 5545) writer for all-day holiday events. Hand-rolled
// rather than pulling in a dependency — the format needed here (a flat list
// of all-day VEVENTs) is small enough that a library would be overkill.

const pad = (n) => String(n).padStart(2, "0");

const toICalDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

// iCal all-day DTEND is exclusive (the day after the last day of the event),
// so we add one day when converting our inclusive endDate.
const toICalDateExclusiveEnd = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return toICalDate(d);
};

const escapeICalText = (str = "") =>
  str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const buildHolidaysICal = (holidays) => {
  const now = new Date();
  const dtstamp = `${toICalDate(now)}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//HRMS//Holidays//EN", "CALSCALE:GREGORIAN"];

  holidays.forEach((h) => {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${h._id}@hrms.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${toICalDate(h.startDate)}`,
      `DTEND;VALUE=DATE:${toICalDateExclusiveEnd(h.endDate)}`,
      `SUMMARY:${escapeICalText(h.title)}`
    );
    if (h.description) lines.push(`DESCRIPTION:${escapeICalText(h.description)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};

module.exports = { buildHolidaysICal };
