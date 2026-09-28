import { leads } from "@/lib/crm-data";
import { toIso } from "./time";
import { assignedIds, type BookEvent } from "./types";

type Place = { city: string; address: string };

const CITIES: Record<string, [number, number]> = {
  phoenix: [33.4484, -112.074],
  surprise: [33.6292, -112.3677],
  scottsdale: [33.4942, -111.9261],
  peoria: [33.5806, -112.2374],
  glendale: [33.5387, -112.186],
  mesa: [33.4152, -111.8315],
  tempe: [33.4255, -111.94],
  chandler: [33.3062, -111.8413],
  gilbert: [33.3528, -111.789],
  dallas: [32.7767, -96.797],
  "fort worth": [32.7555, -97.3308],
};

function pin(place: Place): [number, number] | null {
  const city = place.city.toLowerCase().split(",")[0].trim();
  const base = CITIES[city];
  if (!base) return null;
  const n = Number(place.address.match(/\d+/)?.[0] ?? 0);
  return [base[0] + ((n % 97) - 48) * 0.0035, base[1] + ((n % 53) - 26) * 0.0045];
}

function miles(a: [number, number], b: [number, number]) {
  const r = 3958.8;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function placeOf(e: { personId?: string; city?: string }): Place {
  const lead = e.personId ? leads.find((l) => l.id === e.personId) : undefined;
  return { city: (lead?.city || e.city || "").split(",")[0].trim(), address: lead?.address || "" };
}

export function driveBetween(from: Place, to: Place) {
  if (!from.city || !to.city) return null;
  if (from.address && from.address === to.address && from.city === to.city) return null;
  const a = pin(from);
  const b = pin(to);
  if (!a || !b) return null;
  const mi = miles(a, b);
  if (mi < 0.6) return null;
  return { minutes: Math.max(8, Math.round((mi / 28) * 60)), miles: Math.max(1, Math.round(mi)) };
}

export type DriveLeg = { id: string; start: string; minutes: number; miles: number };

export function driveLegs(events: BookEvent[]): DriveLeg[] {
  const stops = events.filter((e) => e.type !== "Block" && e.type !== "Time-off" && e.type !== "Office").sort((a, b) => a.start.localeCompare(b.start));
  const legs: DriveLeg[] = [];
  for (let i = 0; i < stops.length - 1; i += 1) {
    const drive = driveBetween(placeOf(stops[i]), placeOf(stops[i + 1]));
    if (!drive) continue;
    legs.push({ id: `${stops[i].id}-drive`, start: stops[i].end, minutes: drive.minutes, miles: drive.miles });
  }
  return legs;
}

export function snapAfterDrive(list: BookEvent[], resourceId: string, start: string, here: Place) {
  if (!resourceId) return start;
  const day = start.slice(0, 10);
  const prev = list
    .filter((e) => assignedIds(e).includes(resourceId) && e.start.slice(0, 10) === day && e.end <= start && e.type !== "Block" && e.type !== "Time-off")
    .sort((a, b) => b.end.localeCompare(a.end))[0];
  if (!prev) return start;
  const drive = driveBetween(placeOf(prev), here);
  if (!drive) return start;
  const earliest = new Date(new Date(prev.end).getTime() + drive.minutes * 60000);
  return new Date(start) < earliest ? toIso(earliest) : start;
}
