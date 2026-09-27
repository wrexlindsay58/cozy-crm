import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
import { actingName } from "@/features/staff/store";
import { emptyProperty, type Assessment, type Property } from "../types";
import { emptyPacket, withCats, hale, rows, listeners, emit, write_rows } from "./part-01";

for (const p of hale.packets) {
  for (const ph of p.photos) {
    const cat = p.id === "hvac" ? "HVAC" : p.id === "attic" ? "Attic" : p.id;
    putPhoto(hale.leadId, {
      id: ph.id,
      personId: hale.leadId,
      caption: `${cat} · ${ph.caption}`,
      tone: "info",
      src: ph.src,
      kind: ph.kind,
      name: ph.name,
      pipeline: "Assessment",
      by: hale.closer,
    });
  }
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

export function startAssessment(input: {
  leadId: string;
  name: string;
  address: string;
  closer: string;
  property?: Partial<Property>;
}) {
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
    property: { ...emptyProperty(), ...input.property },
    qualify: {},
    intent: "",
    reportPaid: false,
    reportWaivedBy: "",
    reportWaiveReason: "",
  };
  write_rows({ ...rows, [id]: next });
  addHistory(input.leadId, actingName(), `Assessment ${id} opened.`);
  emit();
  return next;
}

export function setField(id: string, packet: string, key: string, value: string) {
  const cur = rows[id];
  if (!cur) return;
  const packets = cur.packets.some((p) => p.id === packet) ? cur.packets : [...cur.packets, emptyPacket(packet)];
  write_rows({ ...rows, [id]: { ...cur, packets: packets.map((p) => (p.id === packet ? { ...p, fields: { ...p.fields, [key]: value } } : p)) } });
  emit();
}

export function setPacketNotes(id: string, packet: string, notes: string) {
  const cur = rows[id];
  if (!cur) return;
  const packets = cur.packets.some((p) => p.id === packet) ? cur.packets : [...cur.packets, emptyPacket(packet)];
  write_rows({ ...rows, [id]: { ...cur, packets: packets.map((p) => (p.id === packet ? { ...p, notes } : p)) } });
  emit();
}

export function setProperty(id: string, patch: Partial<Property>) {
  const cur = rows[id];
  if (!cur) return;
  write_rows({ ...rows, [id]: { ...cur, property: { ...cur.property, ...patch } } });
  emit();
}

export function setQualify(id: string, questionId: string, value: string) {
  const cur = rows[id];
  if (!cur) return;
  write_rows({ ...rows, [id]: { ...cur, qualify: { ...cur.qualify, [questionId]: value } } });
  emit();
}

export function addPacketPhoto(id: string, packet: string, caption: string, file?: File, category = packet) {
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
    write_rows({
      ...rows,
      [id]: { ...row, packets: packets.map((p) => (p.id === packet ? { ...p, photos: [photo, ...p.photos] } : p)) },
    });
    putPhoto(row.leadId, {
      id: photo.id,
      personId: row.leadId,
      caption: `${category} · ${photo.caption}`,
      tone: "info",
      src: photo.src,
      kind: photo.kind,
      name: photo.name,
      pipeline: "Assessment",
      by: actingName(),
    });
    addHistory(row.leadId, actingName(), `${category} file: ${photo.caption}.`);
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
