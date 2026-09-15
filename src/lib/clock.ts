const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatClock(d = new Date()) {
  const h = d.getHours();
  const m = d.getMinutes();
  const h12 = h % 12 || 12;
  const ap = h >= 12 ? "p" : "a";
  const mm = String(m).padStart(2, "0");
  return {
    label: `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}, ${h12}:${mm}${ap}`,
    hour: h,
  };
}

export function clockLabel(d = new Date()) {
  return formatClock(d).label;
}
