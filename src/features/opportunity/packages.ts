export const PACKAGES = [
  { id: "hvac", label: "HVAC + ducts", skus: ["hvac", "ducts"] },
  { id: "attic", label: "Attic insulation", skus: ["attic-r49"] },
  { id: "comfort", label: "Comfort (attic + air seal)", skus: ["attic-r49", "air-seal"] },
  { id: "envelope", label: "Envelope", skus: ["attic-r49", "air-seal", "aeroseal"] },
] as const;

export type PackageId = (typeof PACKAGES)[number]["id"];
