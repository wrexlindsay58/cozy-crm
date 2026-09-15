import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { addPhoto, kindFromFile } from "@/features/photos/store";
import { activeCategories } from "./categories";
import { emptyProperty, type Assessment, type Packet, type Property } from "./types";

function emptyPacket(id: string): Packet {
  return { id, fields: {}, photos: [], notes: "" };
}

function withCats(packets: Packet[]): Packet[] {
  const ids = activeCategories().map((c) => c.id);
  const have = new Map(packets.map((p) => [p.id, p]));
  return ids.map((id) => have.get(id) ?? emptyPacket(id));
}

const hale: Assessment = {
  id: "AS-19",
  leadId: "L-4819",
  name: "Todd & Kim Hale",
  address: "7721 E Via de Ventura",
  closer: "Dana Ortiz",
  status: "Open",
  property: {
    yearBuilt: "1998",
    sqft: "2140",
    stories: "1",
    occupancy: "Owner",
    hoa: "Via de Ventura",
    access: "Side gate. Dog in backyard.",
    electrical: "200A, garage wall",
    notes: "Both home. Hatch in hall closet.",
  },
  packets: [
    { id: "hvac", fields: { Brand: "Goodman", Model: "GSX14", Age: "16 yr", Tonnage: "4", Condition: "End of life" }, photos: [{ id: "AP-1", caption: "Condenser west pad" }], notes: "Pad is cracked. Line set through the wall, no whip." },
    { id: "attic", fields: { "Current depth": "4 in", Type: "Blown cellulose", Target: "R-49", Hatch: "Hall closet" }, photos: [{ id: "AP-2", caption: "Hatch looking east" }], notes: "Can lights, no baffles on the east run." },
    { id: "air-seal", fields: {}, photos: [], notes: "" },
    { id: "ducts", fields: { Material: "Flex", Condition: "Leaky boots" }, photos: [], notes: "" },
    { id: "windows", fields: {}, photos: [], notes: "" },
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
  const next: Assessment = {
    id,
    leadId: input.leadId,
    name: input.name,
    address: input.address,
    closer: input.closer,
    status: "Open",
    packets: withCats([]),
    property: emptyProperty(),
  };
  rows = { ...rows, [id]: next };
  addHistory(input.leadId, input.closer, `Assessment ${id} opened.`);
  emit();
  return next;
}
export function setField(id: string, packet: string, key: string, value: string) {
  const cur = rows[id];
  if (!cur) return;
  const packets = cur.packets.some((p) => p.id === packet) ? cur.packets : [...cur.packets, emptyPacket(packet)];
  rows = { ...rows, [id]: { ...cur, packets: packets.map((p) => (p.id === packet ? { ...p, fields: { ...p.fields, [key]: value } } : p)) } };
  emit();
}
export function setPacketNotes(id: string, packet: string, notes: string) {
  const cur = rows[id];
  if (!cur) return;
  const packets = cur.packets.some((p) => p.id === packet) ? cur.packets : [...cur.packets, emptyPacket(packet)];
  rows = { ...rows, [id]: { ...cur, packets: packets.map((p) => (p.id === packet ? { ...p, notes } : p)) } };
  emit();
}
export function setProperty(id: string, patch: Partial<Property>) {
  const cur = rows[id];
  if (!cur) return;
  rows = { ...rows, [id]: { ...cur, property: { ...cur.property, ...patch } } };
  emit();
}
export function addPacketPhoto(id: string, packet: string, caption: string, file?: File) {
  const cur = rows[id];
  if (!cur) return false;
  const label = caption.trim() || file?.name || "";
  if (!label && !file) return false;
  const apply = (src?: string) => {
    const row = rows[id];
    if (!row) return;
    const packets = row.packets.some((p) => p.id === packet) ? row.packets : [...row.packets, emptyPacket(packet)];
    const photo = {
      id: `AP-${Date.now()}`,
      caption: label || "Photo",
      src,
      kind: file ? kindFromFile(file) : ("photo" as const),
      name: file?.name,
    };
    rows = {
      ...rows,
      [id]: { ...row, packets: packets.map((p) => (p.id === packet ? { ...p, photos: [photo, ...p.photos] } : p)) },
    };
    addPhoto(row.leadId, photo.caption, src, photo.kind, file?.name);
    addHistory(row.leadId, row.closer, `Photo on ${packet}: ${photo.caption}.`);
    emit();
  };
  if (file) {
    const reader = new FileReader();
    reader.onload = () => apply(typeof reader.result === "string" ? reader.result : undefined);
    reader.readAsDataURL(file);
    return true;
  }
  apply();
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
