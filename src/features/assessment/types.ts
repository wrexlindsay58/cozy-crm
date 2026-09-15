export const PACKET_DEFS = [
  { id: "hvac", label: "HVAC", fields: ["Brand", "Model", "Age", "Tonnage", "Condition"] },
  { id: "attic", label: "Attic", fields: ["Current depth", "Type", "Target", "Hatch"] },
  { id: "air-seal", label: "Air sealing", fields: ["Leak notes"] },
  { id: "ducts", label: "Ducts", fields: ["Material", "Condition"] },
  { id: "windows", label: "Windows", fields: ["Count", "Condition"] },
] as const;

export type PacketId = (typeof PACKET_DEFS)[number]["id"];
export type PacketPhoto = { id: string; caption: string };
export type Packet = { id: PacketId; fields: Record<string, string>; photos: PacketPhoto[] };
export type Assessment = {
  id: string;
  leadId: string;
  name: string;
  address: string;
  closer: string;
  status: "Open" | "Complete";
  packets: Packet[];
  oppId?: string;
};
