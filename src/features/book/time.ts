export const YEAR = 2026;
export const MONTH = 8;
export const TODAY = new Date(YEAR, MONTH, 16);

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
export function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function parseClock(t: string) {
  const s = t.trim().toLowerCase().replace(/\s/g, "");
  const pm = /p/.test(s);
  const am = /a/.test(s) && !pm;
  const core = s.replace(/[ap]m?/, "");
  const [hh, mm] = core.split(":");
  let h = Number(hh);
  const m = Number(mm || 0);
  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return { h, m };
}
export function durationHrs(d?: string) {
  if (!d || d === "All day") return 8;
  if (d === "30m") return 0.5;
  if (d.endsWith("h")) return Number.parseFloat(d) || 2;
  return 2;
}
export function isoOn(day: number, time: string) {
  const { h, m } = parseClock(time);
  return `${YEAR}-${pad(MONTH + 1)}-${pad(day)}T${pad(h)}:${pad(m)}`;
}
export function isoDateTime(date: string, time: string) {
  const { h, m } = parseClock(time.includes(":") && time.length === 5 ? toClock(Number(time.slice(0, 2)) + Number(time.slice(3, 5)) / 60) : time);
  if (/^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(time)) return `${date}T${time}`;
  return `${date}T${pad(h)}:${pad(m)}`;
}
export function toClock(hour: number) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const d = new Date(YEAR, MONTH, 1, h, m);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: m ? "2-digit" : undefined }).toLowerCase().replace(" ", "").replace(":00", "");
}
export function addHrs(iso: string, hrs: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + Math.round(hrs * 60));
  return toIso(d);
}
export function dayOf(iso: string) {
  return Number(iso.slice(8, 10));
}
export function dateOf(iso: string) {
  return iso.slice(0, 10);
}
export function hourOf(iso: string) {
  return Number(iso.slice(11, 13)) + Number(iso.slice(14, 16)) / 60;
}
export function labelDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
export function labelTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}
export function rangeHours(from: number, to: number) {
  const out: number[] = [];
  for (let h = from; h < to; h += 1) out.push(h);
  return out;
}
export function daysInMonth() {
  return new Date(YEAR, MONTH + 1, 0).getDate();
}
export function monthGrid() {
  const first = new Date(YEAR, MONTH, 1).getDay();
  const n = daysInMonth();
  const cells: number[] = Array.from({ length: first }, () => 0);
  for (let d = 1; d <= n; d += 1) cells.push(d);
  while (cells.length % 7) cells.push(0);
  return cells;
}
export function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
export function isoFromDateHour(d: Date, hour: number) {
  const x = new Date(d);
  x.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
  return toIso(x);
}
