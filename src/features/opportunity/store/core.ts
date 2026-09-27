import type { Proposal } from "./types";
import { attachSigned } from "./seed-03";
import { seedFor } from "./seed-02";
import { opportunities, type Opportunity } from "@/lib/crm-data";

export let proposals: Record<string, Proposal> = Object.fromEntries(
  opportunities.map((o) => [o.id, attachSigned(seedFor(o.id, o.leadId, o.closer, o.product, o.stage))]),
);

export let extraOpps: Opportunity[] = [];

export const listeners = new Set<() => void>();

export function emit() {
  listeners.forEach((l) => l());
}

export function snap() {
  return proposals;
}

export function write_proposals(next: typeof proposals) {
  proposals = next;
  return next;
}

export function write_extraOpps(next: typeof extraOpps) {
  extraOpps = next;
  return next;
}
