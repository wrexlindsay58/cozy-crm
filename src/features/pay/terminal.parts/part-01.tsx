import { useState } from "react";
import { money } from "@/lib/crm-data";
import { chargeCard, type ChargeResult } from "../charge";
import { cardProblems, type CardFields } from "../card";
import type { PayRail } from "../rails";
import { CardChargeView } from "./part-02";

export const input = "mt-1 h-11 w-full rounded-md border bg-card px-3 text-sm outline-none focus:border-navy";

export function CardCharge({
  amount,
  purpose,
  vault,
  intent = "charge",
  onPaid,
  onFailed,
  onCancel,
}: {
  amount: number;
  purpose: string;
  vault?: { vaultId: string; brand: string; last4: string; rail?: PayRail };
  intent?: "charge" | "save";
  onPaid: (slip: ChargeResult & { exp: string; name: string }) => void;
  onFailed?: (reason: string) => void;
  onCancel?: () => void;
}) {
  const [card, setCard] = useState<CardFields>({ name: "", pan: "", exp: "", cvc: "", zip: "" });
  const [rail, setRail] = useState<PayRail>(vault?.rail ?? "stripe");
  const [miss, setMiss] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const bad = (key: string) => miss.includes(key);

  async function charge(saved?: { vaultId: string }) {
    setReason("");
    if (!saved) {
      const problems = cardProblems(card);
      setMiss(problems);
      if (problems.length) return;
    }
    setBusy(true);
    try {
      const result = await chargeCard({
        data: saved
          ? { amountCents: intent === "save" ? 0 : Math.round(amount * 100), purpose, vaultId: saved.vaultId, rail, intent }
          : { amountCents: intent === "save" ? 0 : Math.round(amount * 100), purpose, name: card.name.trim(), pan: card.pan, exp: card.exp, cvc: card.cvc, zip: card.zip.trim(), rail, intent },
      });
      if (!result.ok) {
        const why = result.reason || "Card declined.";
        setReason(why);
        if (result.processor !== "goodleap") onFailed?.(why);
        return;
      }
      onPaid({ ...result, exp: card.exp, name: card.name.trim() });
    } catch {
      setReason("The processor did not answer. Nothing was charged.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <CardChargeView bag={{ charge, setRail, rail, card, setCard, bad, miss, reason, busy, intent, amount, vault, onCancel }} />
  );
}

export function PaymentTerminal({
  title,
  amount,
  purpose,
  vault,
  intent = "charge",
  onPaid,
  onFailed,
  onClose,
}: {
  title: string;
  amount: number;
  purpose: string;
  vault?: { vaultId: string; brand: string; last4: string; rail?: PayRail };
  intent?: "charge" | "save";
  onPaid: (slip: ChargeResult & { exp: string; name: string }) => void;
  onFailed?: (reason: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy/40 p-4" role="dialog" aria-label={title}>
      <div className="w-full max-w-md rounded-md border border-line bg-card p-5 shadow-lg">
        <p className="text-[11px] font-bold tracking-[0.14em] text-navy uppercase">Card</p>
        <h3 className="mt-1 text-lg font-semibold">{title}</h3>
        {intent === "save" ? <p className="mt-1 text-sm text-muted">Nothing is charged. The open invoice stays open.</p> : <p className="mt-1 text-2xl font-semibold text-navy">{money(amount)}</p>}
        <div className="mt-4">
          <CardCharge amount={amount} purpose={purpose} vault={vault} intent={intent} onPaid={onPaid} onFailed={onFailed} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
