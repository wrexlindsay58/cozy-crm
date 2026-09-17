import { useSyncExternalStore } from "react";
import { stops as seed, units, type Stop } from "@/lib/dispatch-data";

export type JobKind = Stop["kind"] | "service" | "callback" | "materials";

export type Work = Omit<Stop, "kind"> & { kind: JobKind; unitId: string | null };

const extra: Work[] = [
  {
    id: "S-open-santos",
    leadId: "L-4808",
    name: "Santos packet",
    job: "Drop docs",
    time: "6:30p",
    hour: 18,
    hours: 0.5,
    address: "Surprise",
    city: "Surprise",
    amount: 0,
    pay: "",
    status: "Open",
    kind: "follow-up",
    lat: 33.629,
    lng: -112.358,
    unitId: null,
  },
  {
    id: "S-open-cho",
    leadId: "L-4790",
    name: "Cho punch",
    job: "Attic fill",
    time: "Open",
    hour: 17,
    hours: 2,
    address: "Scottsdale",
    city: "Scottsdale",
    amount: 4200,
    pay: "Check",
    status: "Open",
    kind: "install",
    lat: 33.501,
    lng: -111.926,
    unitId: null,
  },
  {
    id: "S-open-mat",
    name: "WinSupply run",
    job: "HVAC pickup",
    time: "Open",
    hour: 16,
    hours: 1,
    address: "Phoenix",
    city: "Phoenix",
    amount: 0,
    pay: "",
    status: "Open",
    kind: "materials",
    lat: 33.448,
    lng: -112.074,
    unitId: null,
  },
];

const seedWork: Work[] = [
  ...Object.entries(seed).flatMap(([unitId, list]) => list.map((s) => ({ ...s, unitId }))),
  ...extra,
];

let work = seedWork.map((w) => ({ ...w }));
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useWork() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => work,
  );
}

export function assignWork(id: string, unitId: string | null, at?: number) {
  const item = work.find((w) => w.id === id);
  if (!item) return;
  const rest = work.filter((w) => w.id !== id);
  const next = { ...item, unitId };
  if (!unitId) {
    work = [...rest, next];
    emit();
    return;
  }
  const owned = rest.filter((w) => w.unitId === unitId);
  const others = rest.filter((w) => w.unitId !== unitId);
  const i = Math.max(0, Math.min(at ?? owned.length, owned.length));
  owned.splice(i, 0, next);
  work = [...others, ...owned];
  emit();
}

export function reorderWork(unitId: string, fromId: string, toId: string) {
  const owned = work.filter((w) => w.unitId === unitId);
  const from = owned.findIndex((w) => w.id === fromId);
  const to = owned.findIndex((w) => w.id === toId);
  if (from < 0 || to < 0 || from === to) return;
  const next = [...owned];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  const others = work.filter((w) => w.unitId !== unitId);
  work = [...others, ...next];
  emit();
}

export function applyOrder(unitId: string, ids: string[]) {
  const map = new Map(work.filter((w) => w.unitId === unitId).map((w) => [w.id, w]));
  const next = ids.map((id) => map.get(id)).filter(Boolean) as Work[];
  const leftover = work.filter((w) => w.unitId === unitId && !ids.includes(w.id));
  const others = work.filter((w) => w.unitId !== unitId);
  work = [...others, ...next, ...leftover];
  emit();
}

export function unitWork(unitId: string, list = work) {
  return list.filter((w) => w.unitId === unitId);
}

export function openWork(list = work) {
  return list.filter((w) => !w.unitId);
}

export function isBehind(unitId: string, hour = 18) {
  const u = units.find((x) => x.id === unitId);
  const jobs = unitWork(unitId);
  if (u?.status === "late") return true;
  return jobs.some((j) => j.status !== "Ran" && j.status !== "No sit" && hour >= j.hour && u?.status === "en-route");
}

export function kindLabel(k: JobKind) {
  if (k === "run") return "Sit";
  if (k === "install") return "Install";
  if (k === "follow-up") return "Follow-up";
  if (k === "callback") return "Callback";
  if (k === "materials") return "Materials";
  return "Service";
}
