import { MixView, RankBy } from "./bits-01";
import { money } from "@/lib/crm-data";

export const RANK_ITEMS: { id: RankBy; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "sold", label: "Sold $" },
  { id: "qty", label: "Quantity" },
  { id: "close", label: "Close" },
  { id: "nsa", label: "NRA" },
  { id: "avg", label: "Avg ticket" },
];

export const CLOSE_RATE: Record<string, number> = {
  "Dana Ortiz": 0.43,
  "Marco Velez": 0.34,
  "Luis Haddad": 0.36,
  "Cole Brennan": 0.48,
  "Nate Solis": 0.23,
};

export function mixValue(view: MixView, amount: number, qty: number) {
  return view === "qty" ? qty : amount;
}

export function mixLabel(view: MixView, amount: number, qty: number) {
  return view === "qty" ? String(qty) : money(amount);
}
