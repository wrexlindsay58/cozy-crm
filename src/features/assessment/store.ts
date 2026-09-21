import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
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
    yearBuilt: "2004",
    sqft: "2140",
    stories: "2",
    occupancy: "Owner",
    hoa: "Via de Ventura",
    access: "Side gate. Dog in backyard.",
    electrical: "200A, garage wall",
    notes: "Both home. Hatch in hall closet.",
    utility: "APS",
    bothHome: "Yes",
    hotRooms: "West bedrooms",
    coldRooms: "Kitchen",
    indoorTemp: "78",
    outdoorTemp: "104",
  },
  qualify: {},
  packets: [
    {
      id: "hvac",
      fields: {
        "System type": "Split",
        Brand: "Goodman",
        "Outdoor model": "GSX14",
        "Manufacture year": "2008",
        Tonnage: "4",
        Refrigerant: "R-22",
        "Filter size": "16x25",
        "Return temp (°F)": "78",
        "Supply temp (°F)": "58",
        "Delta T (°F)": "20",
        "Disconnect present": "Yes",
      },
      photos: [{ id: "AP-1", caption: "Condenser data plate" }],
      notes: "Line set through the wall. Pad settled 1 in on the west edge.",
    },
    {
      id: "attic",
      fields: {
        "Hatch location": "Hall closet",
        "Insulation type": "Blown cellulose",
        "Depth (in)": "4",
        Coverage: "Joists visible east run",
        Baffles: "None on east",
        "Can lights (count)": "8",
        "Knee walls": "No",
        "Roof deck": "OSB",
        "Attic storage": "No",
      },
      photos: [{ id: "AP-2", caption: "Hatch looking east" }],
      notes: "",
    },
    { id: "air-seal", fields: { "Top plates open": "Yes", "Unsealed cans (count)": "8", "Hatch weatherstrip": "No" }, photos: [], notes: "" },
    {
      id: "ducts",
      fields: { Material: "Flex", Location: "Attic", "Supply registers (count)": "11", "Return registers (count)": "2", "Return size": "16x25", "Boot leaks (count)": "4" },
      photos: [],
      notes: "",
    },
    { id: "windows", fields: { Count: "18", Glazing: "Double", Frame: "Vinyl", "Failed seals (count)": "2" }, photos: [], notes: "" },
  ],
};

let rows: Record<string, Assessment> = { "AS-19": hale };
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
    });
  }
}
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
export function setQualify(id: string, questionId: string, value: string) {
  const cur = rows[id];
  if (!cur) return;
  rows = { ...rows, [id]: { ...cur, qualify: { ...cur.qualify, [questionId]: value } } };
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
    rows = {
      ...rows,
      [id]: { ...row, packets: packets.map((p) => (p.id === packet ? { ...p, photos: [photo, ...p.photos] } : p)) },
    };
    putPhoto(row.leadId, {
      id: photo.id,
      personId: row.leadId,
      caption: `${category} · ${photo.caption}`,
      tone: "info",
      src: photo.src,
      kind: photo.kind,
      name: photo.name,
    });
    addHistory(row.leadId, row.closer, `${category} file: ${photo.caption}.`);
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
