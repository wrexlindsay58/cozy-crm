import { cardBrand, digitsOnly, splitExp, type CardBrand } from "../card";
import type { PayRail } from "../rails";

export type ChargeRequest = {
  amountCents: number;
  purpose: string;
  name?: string;
  pan?: string;
  exp?: string;
  cvc?: string;
  zip?: string;
  vaultId?: string;
  rail?: PayRail;
  intent?: "charge" | "save";
};

export type ChargeResult = {
  ok: boolean;
  processor: "stripe" | "stripe-test" | "goodleap";
  reason?: string;
  brand?: CardBrand | "";
  last4?: string;
  receipt?: string;
  vaultId?: string;
};

export const vault = new Map<string, { brand: CardBrand | ""; last4: string }>();

export function declineReason(pan: string) {
  if (pan === "4000000000000002") return "Card declined.";
  if (pan === "4000000000009995") return "Insufficient funds.";
  if (pan === "4000000000000069") return "The card is expired.";
  if (pan === "4000000000000127") return "The security code is wrong.";
  return "";
}

export async function stripeCharge(secret: string, input: ChargeRequest, pan: string): Promise<ChargeResult> {
  const exp = splitExp(input.exp ?? "");
  const brand = cardBrand(pan);
  const params = new URLSearchParams();
  params.set("amount", String(input.amountCents));
  params.set("currency", "usd");
  params.set("confirm", "true");
  params.set("description", input.purpose.slice(0, 200));
  params.set("payment_method_types[0]", "card");
  params.set("payment_method_data[type]", "card");
  params.set("payment_method_data[card][number]", pan);
  params.set("payment_method_data[card][exp_month]", String(exp?.month ?? ""));
  params.set("payment_method_data[card][exp_year]", String(exp?.year ?? ""));
  params.set("payment_method_data[card][cvc]", digitsOnly(input.cvc ?? ""));
  if (input.name) params.set("payment_method_data[billing_details][name]", input.name.slice(0, 80));
  if (input.zip) params.set("payment_method_data[billing_details][address][postal_code]", input.zip);
  const res = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const json = (await res.json()) as {
    id?: string;
    status?: string;
    payment_method?: string;
    error?: { message?: string };
    last_payment_error?: { message?: string };
  };
  if (json.status === "succeeded" && json.id) {
    const last4 = pan.slice(-4);
    const vaultId = typeof json.payment_method === "string" ? json.payment_method : json.id;
    vault.set(vaultId, { brand, last4 });
    return { ok: true, processor: "stripe", brand, last4, receipt: json.id, vaultId };
  }
  return { ok: false, processor: "stripe", reason: json.error?.message || json.last_payment_error?.message || "Card declined." };
}
