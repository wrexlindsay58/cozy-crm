import { useSyncExternalStore } from "react";
import type { RangeId } from "@/lib/sales-data";

export type CustomBoard = {
  id: string;
  name: string;
  sourceId: string;
  metricId: string;
  range: RangeId;
  who: string[];
};

const KEY = "cozy-leaderboards";
const listeners = new Set<() => void>();

function read(): CustomBoard[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as CustomBoard[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let boards = read();

function emit() {
  boards = [...boards];
  try {
    localStorage.setItem(KEY, JSON.stringify(boards));
  } catch {
    /* demo storage can be blocked */
  }
  listeners.forEach((l) => l());
}

export function useCustomBoards() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => boards,
    () => boards,
  );
}

export function saveCustom(input: Omit<CustomBoard, "id">) {
  const row: CustomBoard = { ...input, id: `LB-${Date.now()}` };
  boards = [...boards, row];
  emit();
  return row.id;
}

export function removeCustom(id: string) {
  boards = boards.filter((b) => b.id !== id);
  emit();
}
