export function stateOf(city: string, office?: string) {
  const t = `${city} ${office ?? ""}`.toLowerCase();
  if (/dallas|fort worth|\btx\b/.test(t)) return "TX";
  return "AZ";
}

export function cityState(city: string, office?: string) {
  if (!city) return "";
  if (/,\s*[A-Z]{2}\s*$/i.test(city.trim())) return city.trim();
  return `${city}, ${stateOf(city, office)}`;
}

export function placeLine(address: string, city: string, office?: string, extra?: string) {
  return [address, cityState(city, office), extra].filter(Boolean).join(" · ");
}
