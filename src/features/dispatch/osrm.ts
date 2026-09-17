export type PathLeg = { coords: [number, number][]; seconds: number; miles: number };

const cache = new Map<string, PathLeg>();

function trafficFactor(hour: number) {
  if (hour >= 7 && hour < 9) return 1.35;
  if (hour >= 16 && hour < 19) return 1.45;
  if (hour >= 11 && hour < 13) return 1.12;
  return 1;
}

export function rushLabel(hour: number) {
  const f = trafficFactor(hour);
  if (f >= 1.4) return "Rush";
  if (f >= 1.2) return "Heavy";
  return "Clear";
}

function key(pts: { lng: number; lat: number }[]) {
  return pts.map((p) => `${p.lng.toFixed(4)},${p.lat.toFixed(4)}`).join(";");
}

export async function fetchPath(pts: { lng: number; lat: number }[], hour: number): Promise<PathLeg | null> {
  if (pts.length < 2) return null;
  const k = key(pts);
  const hit = cache.get(k);
  if (hit) return { ...hit, seconds: Math.round(hit.seconds * trafficFactor(hour)) };
  const path = pts.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson&alternatives=false`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      code?: string;
      routes?: { duration: number; distance: number; geometry?: { coordinates: [number, number][] } }[];
    };
    const r = json.routes?.[0];
    if (!r?.geometry?.coordinates?.length) return null;
    const raw: PathLeg = { coords: r.geometry.coordinates, seconds: r.duration, miles: r.distance / 1609.34 };
    cache.set(k, raw);
    return { ...raw, seconds: Math.round(raw.seconds * trafficFactor(hour)) };
  } catch {
    return null;
  }
}

export async function optimizeStops(start: { lng: number; lat: number }, stops: { id: string; lng: number; lat: number }[]): Promise<string[] | null> {
  if (!stops.length) return [];
  if (stops.length === 1) return [stops[0].id];
  const pts = [{ id: "_", ...start }, ...stops];
  const path = pts.map((p) => `${p.lng},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/trip/v1/driving/${path}?source=first&roundtrip=false&overview=false`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { waypoints?: { waypoint_index: number }[] };
    const w = json.waypoints;
    if (!w || w.length !== pts.length) return null;
    return pts
      .map((p, i) => ({ id: p.id, i: w[i].waypoint_index }))
      .sort((a, b) => a.i - b.i)
      .map((p) => p.id)
      .filter((id) => id !== "_");
  } catch {
    return null;
  }
}

export function mins(seconds: number) {
  return Math.max(1, Math.round(seconds / 60));
}
