import { shop, stops, units } from "@/lib/dispatch-data";
import type { Resource } from "@/features/book/roster";
import type { BookEvent } from "@/features/book/types";
import { HEX } from "@/lib/tokens";
import { TYPE_TONE } from "@/features/book/tone";

const CITY: Record<string, { lat: number; lng: number }> = {
  Surprise: { lat: 33.629, lng: -112.368 },
  Phoenix: { lat: 33.448, lng: -112.074 },
  Scottsdale: { lat: 33.494, lng: -111.926 },
  Peoria: { lat: 33.58, lng: -112.237 },
  Glendale: { lat: 33.538, lng: -112.186 },
  Dallas: { lat: 32.776, lng: -96.797 },
  "Fort Worth": { lat: 32.755, lng: -97.331 },
};

const known: Record<string, { lat: number; lng: number }> = {};
for (const list of Object.values(stops)) {
  for (const s of list) {
    if (s.leadId) known[s.leadId] = { lat: s.lat, lng: s.lng };
  }
}

function hash(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i += 1) n = (n * 33 + id.charCodeAt(i)) >>> 0;
  return n;
}

export function geoOf(e: BookEvent) {
  if (e.personId && known[e.personId]) return known[e.personId];
  const c = CITY[e.city] ?? (e.office === "DFW" ? CITY.Dallas : CITY.Phoenix);
  const n = hash(e.id);
  return { lat: c.lat + ((n % 37) - 18) * 0.003, lng: c.lng + ((((n / 37) | 0) % 37) - 18) * 0.003 };
}

export function pingOf(r: Resource) {
  const u = units.find((x) => x.id === r.id);
  if (u) return { lat: u.lat, lng: u.lng };
  const base = r.office === "DFW" ? shop.DFW : shop.PHX;
  const n = hash(r.id);
  return { lat: base.lat + ((n % 9) - 4) * 0.004, lng: base.lng + ((((n / 9) | 0) % 9) - 4) * 0.004 };
}

export function pinColor(e: BookEvent) {
  return TYPE_TONE[e.type]?.bar ?? HEX.navy;
}

export function isField(e: BookEvent) {
  if (e.blank) return false;
  return e.type !== "Time-off" && e.type !== "Office" && e.type !== "Training";
}

export function phoneOf(id: string) {
  return units.find((u) => u.id === id)?.phone ?? "";
}
