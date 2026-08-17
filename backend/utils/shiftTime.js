const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Total working minutes for a shift, net of break time. Handles shifts that
// cross midnight (endTime numerically before startTime, e.g. 22:00 -> 06:00)
// by wrapping the duration through 24 hours instead of returning a negative
// or nonsensical value.
const computeWorkingMinutes = (startTime, endTime, breakDuration = 0) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  let duration = end - start;
  if (duration <= 0) duration += 24 * 60;
  return Math.max(duration - breakDuration, 0);
};

const formatMinutesAsHours = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

module.exports = { timeToMinutes, computeWorkingMinutes, formatMinutesAsHours };
