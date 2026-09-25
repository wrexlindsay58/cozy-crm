import type { FileKind } from "@/lib/file-data";

export type PacketPhoto = { id: string; caption: string; src?: string; kind?: FileKind; name?: string };
export type Packet = { id: string; fields: Record<string, string>; photos: PacketPhoto[]; notes: string };
export type Property = {
  yearBuilt: string;
  sqft: string;
  stories: string;
  occupancy: string;
  hoa: string;
  access: string;
  electrical: string;
  notes: string;
  utility: string;
  bothHome: string;
  hotRooms: string;
  coldRooms: string;
  indoorTemp: string;
  outdoorTemp: string;
  occupants: string;
  peakBill: string;
};
export type Assessment = {
  id: string;
  leadId: string;
  name: string;
  address: string;
  closer: string;
  status: "Open" | "Complete";
  packets: Packet[];
  property: Property;
  qualify: Record<string, string>;
  oppId?: string;
  intent: "" | "Yes" | "No";
  reportPaid: boolean;
  reportWaivedBy: string;
  reportWaiveReason: string;
  reportCharge?: { method: "Card" | "Cash" | "Check"; last4: string; brand: string; receipt: string };
};

export const emptyProperty = (): Property => ({
  yearBuilt: "",
  sqft: "",
  stories: "",
  occupancy: "Owner",
  hoa: "",
  access: "",
  electrical: "",
  notes: "",
  utility: "",
  bothHome: "",
  hotRooms: "",
  coldRooms: "",
  indoorTemp: "",
  outdoorTemp: "",
  occupants: "",
  peakBill: "",
});
