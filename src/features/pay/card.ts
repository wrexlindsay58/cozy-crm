export type CardBrand = "Visa" | "Mastercard" | "Amex" | "Discover";

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function cardBrand(pan: string): CardBrand | "" {
  const n = digitsOnly(pan);
  if (/^3[47]/.test(n)) return "Amex";
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "Mastercard";
  if (/^6/.test(n)) return "Discover";
  return "";
}

export function formatPan(value: string) {
  const n = digitsOnly(value).slice(0, cardBrand(value) === "Amex" ? 15 : 16);
  if (cardBrand(n) === "Amex") return [n.slice(0, 4), n.slice(4, 10), n.slice(10)].filter(Boolean).join(" ");
  return n.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function luhn(pan: string) {
  const n = digitsOnly(pan);
  if (n.length < 13 || n.length > 16) return false;
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function splitExp(exp: string) {
  const match = exp.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return;
  return { month, year };
}

export function expPast(exp: string, now = new Date()) {
  const parts = splitExp(exp);
  if (!parts) return true;
  const end = new Date(parts.year, parts.month, 0, 23, 59, 59);
  return end < now;
}

export type CardFields = { name: string; pan: string; exp: string; cvc: string; zip: string };

export function cardProblems(card: CardFields, now = new Date()) {
  const pan = digitsOnly(card.pan);
  const brand = cardBrand(pan);
  const problems: string[] = [];
  if (!card.name.trim()) problems.push("name");
  if (!luhn(pan) || (brand === "Amex" ? pan.length !== 15 : pan.length !== 16)) problems.push("pan");
  if (!splitExp(card.exp) || expPast(card.exp, now)) problems.push("exp");
  const cvc = digitsOnly(card.cvc);
  if (cvc.length !== (brand === "Amex" ? 4 : 3)) problems.push("cvc");
  if (!/^\d{5}$/.test(card.zip.trim())) problems.push("zip");
  return problems;
}
