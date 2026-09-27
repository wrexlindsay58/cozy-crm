export type HeldRemote =
  | { kind: "upsert"; patch: Record<string, unknown> }
  | { kind: "delete" };

const editing = new Set<string>();
const held = new Map<string, HeldRemote>();
const snapshots = new Map<string, Record<string, unknown>>();

export function isLocallyEditing(id: string) {
  return editing.has(id);
}

export function holdRemote(id: string, event: HeldRemote) {
  held.set(id, event);
}

export function setLocalEditing(id: string, on: boolean, snapshot?: Record<string, unknown>) {
  if (on) {
    editing.add(id);
    if (snapshot && !snapshots.has(id)) snapshots.set(id, snapshot);
    return null;
  }
  editing.delete(id);
  const pending = held.get(id) ?? null;
  const base = snapshots.get(id) ?? null;
  held.delete(id);
  snapshots.delete(id);
  return { pending, base };
}

export function reconcileRecord(
  snapshot: Record<string, unknown>,
  current: Record<string, unknown>,
  remote: Record<string, unknown>,
) {
  const next = { ...current };
  for (const [key, value] of Object.entries(remote)) {
    if (key === "id" || !(key in snapshot)) continue;
    if (Object.is(current[key], snapshot[key])) next[key] = value;
  }
  return next;
}
