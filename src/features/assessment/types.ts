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
  oppId?: string;
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
});
