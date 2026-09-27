import { activeCategories } from "../categories";
import type { Assessment, Packet } from "../types";
import { rosterAssessments } from "@/lib/roster";

export function emptyPacket(id: string): Packet {
  return { id, fields: {}, photos: [], notes: "" };
}

export function withCats(packets: Packet[]): Packet[] {
  const ids = activeCategories().map((c) => c.id);
  const have = new Map(packets.map((p) => [p.id, p]));
  return ids.map((id) => have.get(id) ?? emptyPacket(id));
}

export const hale: Assessment = {
  id: "AS-19",
  leadId: "L-4819",
  name: "Todd Hale",
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

export let rows: Record<string, Assessment> = { "AS-19": hale, "AS-18": soldHouse("AS-18", "L-4788", "Ben Cho", "11840 W Desert Hills", "Dana Ortiz"), "AS-17": soldHouse("AS-17", "L-4761", "Ann Whitaker", "Scottsdale", "Dana Ortiz") };

for (const extra of rosterAssessments) {
  rows[extra.id] = { ...soldHouse(extra.id, extra.leadId, extra.name, extra.address, extra.closer), status: extra.status };
}

export const listeners = new Set<() => void>();

export function emit() {
  listeners.forEach((l) => l());
}

export function write_rows(__v: any) { rows = __v; }
