import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { PACKET_DEFS, type Assessment, type Packet, type PacketId } from "./types";

function emptyPackets(): Packet[] {
  return PACKET_DEFS.map((d) => ({ id: d.id, fields: {}, photos: [] }));
}

const hale: Assessment = {
  id: "AS-19",
  leadId: "L-4819",
  name: "Todd & Kim Hale",
  address: "7721 E Via de Ventura",
  closer: "Dana Ortiz",
  status: "Open",
  packets: [
    { id: "hvac", fields: { Brand: "Goodman", Model: "GSX14", Age: "16 yr", Tonnage: "4", Condition: "End of life" }, photos: [{ id: "AP-1", caption: "Condenser west pad" }] },
    { id: "attic", fields: { "Current depth": "4 in", Type: "Blown cellulose", Target: "R-49", Hatch: "Hall closet" }, photos: [{ id: "AP-2", caption: "Hatch looking east" }] },
    { id: "air-seal", fields: {}, photos: [] },
    { id: "ducts", fields: { Material: "Flex", Condition: "Leaky boots" }, photos: [] },
    { id: "windows", fields: {}, photos: [] },
  ],
};

let rows: Record<string, Assessment> = { "AS-19": hale };
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function useAssessments() {
  useSyncExternalStore(subscribe, () => rows, () => rows);
  return Object.values(rows);
}
export function useAssessment(id: string) {
  useSyncExternalStore(subscribe, () => rows, () => rows);
  return rows[id];
}
export function assessmentForLead(leadId: string) {
  return Object.values(rows).find((a) => a.leadId === leadId);
}
export function startAssessment(input: { leadId: string; name: string; address: string; closer: string }) {
  const existing = assessmentForLead(input.leadId);
  if (existing) return existing;
  const id = `AS-${20 + Object.keys(rows).length}`;
  const next: Assessment = { id, leadId: input.leadId, name: input.name, address: input.address, closer: input.closer, status: "Open", packets: emptyPackets() };
  rows = { ...rows, [id]: next };
  addHistory(input.leadId, input.closer, `Assessment ${id} opened.`);
  emit();
  return next;
}
export function setField(id: string, packet: PacketId, key: string, value: string) {
  const cur = rows[id];
  if (!cur) return;
  rows = { ...rows, [id]: { ...cur, packets: cur.packets.map((p) => (p.id === packet ? { ...p, fields: { ...p.fields, [key]: value } } : p)) } };
  emit();
}
export function addPacketPhoto(id: string, packet: PacketId, caption: string) {
  const trimmed = caption.trim();
  if (!trimmed) return false;
  const cur = rows[id];
  if (!cur) return false;
  rows = { ...rows, [id]: { ...cur, packets: cur.packets.map((p) => (p.id === packet ? { ...p, photos: [{ id: `AP-${10 + p.photos.length}`, caption: trimmed }, ...p.photos] } : p)) } };
  addHistory(cur.leadId, cur.closer, `Photo on ${packet}: ${trimmed}.`);
  emit();
  return true;
}
export function completeAssessment(id: string) {
  const cur = rows[id];
  if (!cur || cur.status === "Complete") return cur;
  const oppId = cur.leadId === "L-4819" ? "O-1182" : `O-${1100 + Object.keys(rows).length}`;
  rows = { ...rows, [id]: { ...cur, status: "Complete", oppId } };
  addHistory(cur.leadId, cur.closer, `Assessment complete. Opportunity ${oppId} opened.`);
  emit();
  return rows[id];
}
