export type PriceLine = {
  sku: string;
  label: string;
  unit: number;
  adder?: boolean;
  parent?: string;
};

export const PRICEBOOK: PriceLine[] = [
  { sku: "attic-r49", label: "Attic R-49", unit: 8900 },
  { sku: "removal", label: "Insulation removal", unit: 2400 },
  { sku: "air-seal", label: "Air sealing", unit: 3200 },
  { sku: "aeroseal", label: "Aeroseal", unit: 5400 },
  { sku: "hvac", label: "HVAC replacement", unit: 18600 },
  { sku: "ducts", label: "Ducts", unit: 4200, adder: true, parent: "hvac" },
  { sku: "windows", label: "Windows", unit: 14800 },
];

export const PRODUCTS = PRICEBOOK.filter((p) => !p.adder);
export const ADDERS = PRICEBOOK.filter((p) => p.adder);

export function lineFor(sku: string) {
  return PRICEBOOK.find((p) => p.sku === sku);
}

export function defaultSkus(product: string) {
  const text = product.toLowerCase();
  const skus: string[] = [];
  if (text.includes("attic")) skus.push("attic-r49");
  if (text.includes("remov")) skus.push("removal");
  if (text.includes("air seal") || text.includes("air-seal")) skus.push("air-seal");
  if (text.includes("aeroseal")) skus.push("aeroseal");
  if (text.includes("hvac")) skus.push("hvac");
  if (text.includes("duct")) skus.push("ducts");
  if (text.includes("window")) skus.push("windows");
  if (skus.length === 0) skus.push("attic-r49");
  return skus;
}
