import { useSyncExternalStore } from "react";
import { snap, type Row } from "./part-01";

export let dealership: Row[] = [
  { id: "DS-1", name: "Cozy Home Performance", note: "License · hours · logo later" },
];

export const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAdminSettings() {
  return useSyncExternalStore(subscribe, () => snap, () => snap);
}

export function write_dealership(__v: any) { dealership = __v; }
