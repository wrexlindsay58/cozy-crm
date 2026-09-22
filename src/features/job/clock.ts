export const CLOCKS = [
  "6:00a",
  "6:30a",
  "7:00a",
  "7:30a",
  "8:00a",
  "8:30a",
  "9:00a",
  "9:30a",
  "10:00a",
  "10:30a",
  "11:00a",
  "11:30a",
  "12:00p",
  "12:30p",
  "1:00p",
  "1:30p",
  "2:00p",
  "2:30p",
  "3:00p",
  "3:30p",
  "4:00p",
  "4:30p",
  "5:00p",
  "5:30p",
  "6:00p",
  "6:30p",
  "7:00p",
];

export function clock12(t: string) {
  if (!t) return "";
  if (/[ap]$/i.test(t.trim())) return t.replace(/\s+/g, "");
  const [hRaw, mRaw] = t.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw ?? 0);
  if (Number.isNaN(h)) return t;
  const ap = h >= 12 ? "p" : "a";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")}${ap}`;
}

export function clock24(t: string) {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*([ap])/i);
  if (!m) return t;
  let h = Number(m[1]);
  const min = m[2];
  const ap = m[3].toLowerCase();
  if (ap === "a" && h === 12) h = 0;
  if (ap === "p" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${min}`;
}