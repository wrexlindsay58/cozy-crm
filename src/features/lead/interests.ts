export const INTEREST_OPTIONS = ["Insulation Services", "Duct Services", "HVAC", "All of the above", "Other"] as const;

const SERVICES = ["Insulation Services", "Duct Services", "HVAC"];

export function inferInterests(product: string): string[] {
  const p = product.toLowerCase();
  const out: string[] = [];
  if (/attic|insul|air seal|aeroseal|envelope|cellulose|r-49/.test(p)) out.push("Insulation Services");
  if (/duct/.test(p)) out.push("Duct Services");
  if (/hvac/.test(p)) out.push("HVAC");
  return out;
}

export function interestsLabel(interests: string[], other?: string) {
  if (interests.includes("All of the above")) {
    const extra = interests.includes("Other") && other?.trim() ? `, ${other.trim()}` : "";
    return `Insulation Services, Duct Services, HVAC${extra}`;
  }
  const named = interests.filter((i) => i !== "Other" && i !== "All of the above");
  if (interests.includes("Other") && other?.trim()) named.push(other.trim());
  return named.join(", ");
}

export function toggleInterest(current: string[], name: string) {
  if (name === "All of the above") {
    return current.includes("All of the above") ? current.filter((i) => i !== "All of the above" && !SERVICES.includes(i)) : [...new Set([...current.filter((i) => i !== "All of the above"), ...SERVICES, "All of the above"])];
  }
  const on = current.includes(name);
  const next = on ? current.filter((i) => i !== name) : [...current, name];
  const hasAllServices = SERVICES.every((s) => next.includes(s));
  if (!hasAllServices) return next.filter((i) => i !== "All of the above");
  return next.includes("All of the above") ? next : [...next, "All of the above"];
}
