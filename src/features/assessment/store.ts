import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { sendMessage } from "@/features/thread/store";
import { kindFromFile, putPhoto } from "@/features/photos/store";
import { activeCategories } from "./categories";
import { actingName } from "@/features/staff/store";
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
    occupants: "4",
    peakBill: "610",
  },
  qualify: {},
  intent: "Yes",
  reportPaid: false,
  reportWaivedBy: "",
  reportWaiveReason: "",
  packets: [
    {
      id: "hvac",
      fields: {
        "System type": "Split",
        Brand: "Goodman",
        "Outdoor model": "GSX14",
        "Manufacture year": "2008",
        "Listed SEER": "14",
        Refrigerant: "R-22",
        "Filter size": "16x25",
        "Return temp (°F)": "78",
        "Supply temp (°F)": "58",
        "Delta T (°F)": "20",
        "Return static (in WC)": "0.35",
        "Supply static (in WC)": "0.28",
      },
      photos: [{ id: "AP-1", caption: "Condenser data plate" }],
      notes: "Line set through the wall. Pad settled 1 in on the west edge.",
    },
    {
      id: "attic",
      fields: {
        "Hatch location": "Hall closet",
        "Hatch type": "Ladder",
        "Hatch insulated?": "No",
        "Hatch sealed?": "No",
        "Insulation type": "Blown cellulose",
        "Depth (in)": "4",
        Coverage: "Joists visible east run",
        Baffles: "None on east",
        "Can lights (count)": "8",
        "Knee walls": "No",
        "Roof deck": "OSB",
        "Attic storage": "No",
        "Top plates open": "Yes",
        "Unsealed cans (count)": "8",
        "Hatch weatherstrip": "No",
      },
      photos: [{ id: "AP-2", caption: "Hatch looking east" }],
      notes: "",
    },
    {
      id: "ducts",
      fields: { Material: "Flex", Location: "Attic", "Supply registers (count)": "11", "Return registers (count)": "2", "Return 1 size": "20x25", "Return 2 size": "14x20", "Duct insulation (R)": "R-4", "Disconnected runs (count)": "1", "Boot leaks (count)": "4", Condition: "Kinked, Sagging", "Jump ducts": "0", "Transfer grilles": "0" },
      photos: [],
      notes: "",
    },
    { id: "windows", fields: { Count: "18", "Window temperature (°F)": "114", Glazing: "Double", Frame: "Vinyl", "Failed seals (count)": "2" }, photos: [], notes: "" },
  ],
};

function soldHouse(id: string, leadId: string, name: string, address: string, closer: string): Assessment {
  return {
    id,
    leadId,
    name,
    address,
    closer,
    status: "Complete",
    property: {
      yearBuilt: "1998",
      sqft: "1860",
      stories: "1",
      occupancy: "Owner",
      hoa: "No",
      access: "Gate code on the file. Ladder to the hatch.",
      electrical: "200A",
      notes: "Both owners home for the visit.",
      utility: "APS",
      bothHome: "Yes",
      hotRooms: "",
      coldRooms: "",
      indoorTemp: "79",
      outdoorTemp: "102",
      occupants: "3",
      peakBill: "",
    },
    qualify: {},
    intent: "Yes",
    reportPaid: false,
    reportWaivedBy: "",
    reportWaiveReason: "",
    packets: [
      { id: "hvac", fields: { "System type": "Split", Brand: "Carrier", "Manufacture year": "2006", Tonnage: "4", Refrigerant: "R-22" }, photos: [], notes: "Condenser on the east pad." },
      { id: "attic", fields: { "Insulation type": "Blown cellulose", "Depth (in)": "5", "Hatch location": "Hall" }, photos: [], notes: "" },
      { id: "ducts", fields: { Material: "Flex", "Supply registers (count)": "9", "Return registers (count)": "1" }, photos: [], notes: "" },
      { id: "windows", fields: { Count: "14", Glazing: "Double", Frame: "Vinyl" }, photos: [], notes: "" },
    ],
  };
}

let rows: Record<string, Assessment> = { "AS-19": hale, "AS-18": soldHouse("AS-18", "L-4788", "Ben & Alyssa Cho", "11840 W Desert Hills", "Dana Ortiz"), "AS-17": soldHouse("AS-17", "L-4761", "The Whitakers", "Scottsdale", "Dana Ortiz") };
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
    intent: "",
    reportPaid: false,
    reportWaivedBy: "",
    reportWaiveReason: "",
  };
  rows = { ...rows, [id]: next };
  addHistory(input.leadId, actingName(), `Assessment ${id} opened.`);
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
export function completeAssessment(id: string) {
  const cur = rows[id];
  if (!cur || cur.status === "Complete") return cur;
  const oppId = cur.leadId === "L-4819" ? "O-1182" : `O-${1100 + Object.keys(rows).length}`;
  const credit = cur.reportPaid ? " Report fee of $149 was paid. Credit it on the job if they buy." : "";
  rows = { ...rows, [id]: { ...cur, status: "Complete", oppId } };
  addHistory(cur.leadId, actingName(), `Assessment complete. Opportunity ${oppId} opened.${credit}`);
  emit();
  return rows[id];
}
export function setReportIntent(id: string, intent: "" | "Yes" | "No") {
  const cur = rows[id];
  if (!cur) return;
  rows = { ...rows, [id]: { ...cur, intent } };
  addHistory(cur.leadId, actingName(), intent === "Yes" ? "Marked as a qualified assessment." : "Marked as not a qualified assessment.");
  emit();
}
export function markReportPaid(id: string, charge?: { method: "Card" | "Cash" | "Check"; last4: string; brand: string; receipt: string }) {
  const cur = rows[id];
  if (!cur) return;
  const slip = charge?.method === "Card" && charge.last4 ? `${charge.brand || "Card"} ····${charge.last4}` : charge?.method ?? "Card";
  rows = { ...rows, [id]: { ...cur, reportPaid: true, reportCharge: charge } };
  addHistory(cur.leadId, actingName(), `Charged $149 for the report (${slip}${charge?.receipt ? `, receipt ${charge.receipt}` : ""}). Credit this on the job if they buy.`);
  emit();
}
export function waiveReportFee(id: string, reason: string, by: string) {
  const cur = rows[id];
  const clean = reason.trim();
  if (!cur || !clean) return;
  rows = { ...rows, [id]: { ...cur, reportWaivedBy: by, reportWaiveReason: clean } };
  addHistory(cur.leadId, by, `Waived the $149 report fee. ${clean}`);
  emit();
}
export function sendAssessmentReport(id: string, origin: string, unlocked: boolean) {
  const cur = rows[id];
  if (!cur || !unlocked) return false;
  const url = origin ? `${origin}/report/${id}` : "";
  sendMessage(cur.leadId, `Home performance report for ${cur.address || cur.name}. Measurements only. No prices.${url ? `\n\n${url}` : ""}`, "email", {
    subject: `Your home report · ${cur.address || cur.name}`,
  });
  addHistory(cur.leadId, actingName(), "Assessment report sent.");
  emit();
  return true;
}
