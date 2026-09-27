import { useSyncExternalStore } from "react";
import { accounts, leads, opportunities, projects } from "@/lib/crm-data";

export type FlowPlace = "lead" | "assessment" | "opportunity" | "job" | "account";

export type FlowDoor = { place: FlowPlace; id: string };

const listeners = new Set<() => void>();
let doors: Record<string, FlowDoor> = {};

function put(flowId: string, place: FlowPlace, id: string) {
  doors[flowId] = { place, id };
}

for (const lead of leads) put(lead.id, "lead", lead.id);
put("L-4819", "assessment", "AS-19");
for (const opp of opportunities) {
  if (opp.stage === "Appt set" || opp.stage === "Won, production") continue;
  put(opp.leadId, "opportunity", opp.id);
}
put("L-4788", "job", "P-331");
put("L-4761", "job", "P-328");
put("L-4733", "job", "P-322");
for (const project of projects) {
  if (project.status === "Closed") continue;
  const account = accounts.find((a) => a.id === project.accountId);
  const lead = leads.find((l) => l.name === account?.name);
  const flowId = lead?.id ?? project.accountId;
  if (doors[flowId]?.place === "account") continue;
  if (!lead || doors[flowId]?.place === "lead" || doors[flowId]?.place === "job") put(flowId, "job", project.id);
}
put("A-176", "account", "A-176");
put("A-169", "account", "A-169");
put("A-154", "account", "A-154");

function emit() {
  listeners.forEach((l) => l());
}

export function useDoors() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => doors,
    () => doors,
  );
}

export function doorFor(flowId: string) {
  return doors[flowId] ?? null;
}

export function enterFlow(flowId: string, place: FlowPlace, id: string) {
  if (!flowId) return;
  doors = { ...doors, [flowId]: { place, id } };
  emit();
}
