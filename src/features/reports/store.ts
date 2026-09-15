import { useSyncExternalStore } from "react";
import type { ReportSource, SavedReport } from "./types";

const seed: SavedReport[] = [
  { id: "SR-1", name: "Phoenix leads this week", source: "leads", office: "Phoenix", from: "2026-09-08", to: "2026-09-14", pinned: true },
];
let rows: SavedReport[] = [...seed];
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useSavedReports() {
  return useSyncExternalStore(subscribe, () => rows, () => rows);
}
export function getSaved(id: string) {
  return rows.find((r) => r.id === id);
}
export function saveReport(input: Omit<SavedReport, "id" | "pinned">) {
  const id = `SR-${rows.length + 1}`;
  const next: SavedReport = { ...input, id, pinned: false };
  rows = [next, ...rows];
  emit();
  return next;
}
export function pinReport(id: string) {
  rows = rows.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r));
  emit();
}
export const BUILT_IN: { id: string; title: string; note: string; group: string }[] = [
  { id: "saturday", title: "Saturday board", note: "Late work right now", group: "Daily" },
  { id: "leads", title: "Lead report", note: "Source, status, age, setter", group: "Lead" },
  { id: "calls", title: "Call report", note: "Calls and texts. No Internal.", group: "Call" },
  { id: "funnel", title: "Set / run / close", note: "Year funnel", group: "Sales" },
  { id: "mix", title: "Product mix", note: "Sold $ by product", group: "Sales" },
  { id: "margin", title: "Job margin", note: "Open P&L", group: "Production" },
  { id: "service", title: "Service book", note: "Fee vs cost", group: "Service" },
  { id: "combo", title: "Item with item", note: "Deals that include both products", group: "Sales" },
  { id: "geo", title: "Where they live", note: "Leads and sold by ZIP", group: "Lead" },
];
export const OFFICES = ["All", "Phoenix", "Scottsdale", "Dallas", "Fort Worth"];
export function emptyDraft(source: ReportSource = "leads"): Omit<SavedReport, "id" | "pinned"> {
  return { name: "", source, office: "All", from: "2026-09-01", to: "2026-09-14", zip: "", skuA: "hvac", skuB: "attic-r49" };
}
