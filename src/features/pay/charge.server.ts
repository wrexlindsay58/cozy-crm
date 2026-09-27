import { createServerFn } from "@tanstack/react-start";
import { cardBrand, cardProblems, digitsOnly, splitExp, type CardBrand } from "./card";
import type { PayRail } from "./rails";

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

const vault = new Map<string, { brand: CardBrand | ""; last4: string }>();

function declineReason(pan: string) {
  if (pan === "4000000000000002") return "Card declined.";
  if (pan === "4000000000009995") return "Insufficient funds.";
  if (pan === "4000000000000069") return "The card is expired.";
  if (pan === "4000000000000127") return "The security code is wrong.";
  return "";
}

async function stripeCharge(secret: string, input: ChargeRequest, pan: string): Promise<ChargeResult> {
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

export const chargeCard = createServerFn({ method: "POST" })
  .validator((data: ChargeRequest) => data)
  .handler(async ({ data }): Promise<ChargeResult> => {
    const amount = Math.round(data.amountCents);
    const rail: PayRail = data.rail === "goodleap" ? "goodleap" : "stripe";
    const saving = data.intent === "save";
    if (!saving && (!Number.isFinite(amount) || amount < 50 || amount > 100_000_00)) return { ok: false, processor: rail === "goodleap" ? "goodleap" : "stripe-test", reason: "That amount cannot be charged." };
    if (rail === "goodleap") {
      if (!data.vaultId && !saving) {
        const problems = cardProblems({ name: data.name ?? "", pan: digitsOnly(data.pan ?? ""), exp: data.exp ?? "", cvc: data.cvc ?? "", zip: data.zip ?? "" });
        if (problems.length) return { ok: false, processor: "goodleap", reason: "Check the card. The number, date, code, or ZIP is not valid." };
      }
      if (saving) {
        const problems = cardProblems({ name: data.name ?? "", pan: digitsOnly(data.pan ?? ""), exp: data.exp ?? "", cvc: data.cvc ?? "", zip: data.zip ?? "" });
        if (problems.length) return { ok: false, processor: "goodleap", reason: "Check the card. The number, date, code, or ZIP is not valid." };
      }
      return { ok: false, processor: "goodleap", reason: saving ? "GoodLeap Payments is not connected. The card was not saved." : "GoodLeap Payments is not connected. Nothing was charged." };
    }
    if (data.vaultId) {
      const saved = vault.get(data.vaultId);
      if (!saved) return { ok: false, processor: "stripe-test", reason: "That saved card has no processor token. Run the card again." };
      const { env } = await import("@/lib/env.server");
      const secret = env("STRIPE_SECRET_KEY");
      if (secret && data.vaultId.startsWith("pm_")) {
        const params = new URLSearchParams();
        params.set("amount", String(amount));
        params.set("currency", "usd");
        params.set("confirm", "true");
        params.set("payment_method", data.vaultId);
        params.set("description", data.purpose.slice(0, 200));
        params.set("off_session", "true");
        const res = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const json = (await res.json()) as { id?: string; status?: string; error?: { message?: string } };
        if (json.status === "succeeded" && json.id) return { ok: true, processor: "stripe", brand: saved.brand, last4: saved.last4, receipt: json.id, vaultId: data.vaultId };
        return { ok: false, processor: "stripe", reason: json.error?.message || "Card declined.", brand: saved.brand, last4: saved.last4 };
      }
      return { ok: true, processor: "stripe-test", brand: saved.brand, last4: saved.last4, receipt: `ch_test_${Date.now().toString().slice(-8)}`, vaultId: data.vaultId };
    }
    const pan = digitsOnly(data.pan ?? "");
    const problems = cardProblems({ name: data.name ?? "", pan, exp: data.exp ?? "", cvc: data.cvc ?? "", zip: data.zip ?? "" });
    if (problems.length) return { ok: false, processor: "stripe-test", reason: "Check the card. The number, date, code, or ZIP is not valid." };
    const declined = declineReason(pan);
    if (declined) return { ok: false, processor: "stripe-test", reason: declined, brand: cardBrand(pan), last4: pan.slice(-4) };
    const { env } = await import("@/lib/env.server");
    const secret = env("STRIPE_SECRET_KEY");
    if (saving) {
      const brand = cardBrand(pan);
      const last4 = pan.slice(-4);
      if (secret) {
        const exp = splitExp(data.exp ?? "");
        const params = new URLSearchParams();
        params.set("confirm", "true");
        params.set("usage", "off_session");
        params.set("payment_method_data[type]", "card");
        params.set("payment_method_data[card][number]", pan);
        params.set("payment_method_data[card][exp_month]", String(exp?.month ?? ""));
        params.set("payment_method_data[card][exp_year]", String(exp?.year ?? ""));
        params.set("payment_method_data[card][cvc]", digitsOnly(data.cvc ?? ""));
        if (data.name) params.set("payment_method_data[billing_details][name]", data.name.slice(0, 80));
        if (data.zip) params.set("payment_method_data[billing_details][address][postal_code]", data.zip);
        const res = await fetch("https://api.stripe.com/v1/setup_intents", {
          method: "POST",
          headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const json = (await res.json()) as { id?: string; status?: string; payment_method?: string; error?: { message?: string } };
        if (json.status === "succeeded" && json.id) {
          const vaultId = typeof json.payment_method === "string" ? json.payment_method : json.id;
          vault.set(vaultId, { brand, last4 });
          return { ok: true, processor: "stripe", brand, last4, receipt: json.id, vaultId };
        }
        return { ok: false, processor: "stripe", reason: json.error?.message || "The card was not saved." };
      }
      const vaultId = `pm_test_${last4}_${Date.now().toString().slice(-6)}`;
      vault.set(vaultId, { brand, last4 });
      return { ok: true, processor: "stripe-test", brand, last4, receipt: `seti_test_${Date.now().toString().slice(-8)}`, vaultId };
    }
    if (secret) return stripeCharge(secret, data, pan);
    const brand = cardBrand(pan);
    const last4 = pan.slice(-4);
    const vaultId = `pm_test_${last4}_${Date.now().toString().slice(-6)}`;
    vault.set(vaultId, { brand, last4 });
    return { ok: true, processor: "stripe-test", brand, last4, receipt: `ch_test_${Date.now().toString().slice(-8)}`, vaultId };
  });
