import { useEffect, useState } from "react";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { PaymentTerminal } from "@/features/pay/terminal";
import { parseDay } from "./renew";
import { failPayment, fundHeld, memberPrice, postCardPayment, replaceCard, rollBills, saveAch } from "./store";
import { openVisitRepairs } from "./visits";
import type { LedgerRow, MembershipFile } from "./types";

const TONE: Record<string, string> = {
  Paid: "text-up",
  Open: "text-navy",
  Failed: "text-alert",
  Held: "text-muted",
};

function invoiceName(row: LedgerRow) {
  const note = row.note.replace(/\.$/, "").split(".")[0]?.trim();
  return note || "Invoice";
}

function dueNow(row: LedgerRow) {
  if (row.status !== "Open") return false;
  const due = parseDay(row.at);
  return !due || due <= new Date();
}

export function MembershipMoney({ file }: { file: MembershipFile }) {
  const card = file.card;
  const [run, setRun] = useState<string | null>(null);
  const [bank, setBank] = useState(card?.bank ?? "");
  const [ach4, setAch4] = useState(card?.brand === "ACH" ? card.last4 : "");
  const [achName, setAchName] = useState(card?.brand === "ACH" ? card.name : "");
  const [achMiss, setAchMiss] = useState(false);
  const rows = file.ledger ?? [];
  const openRows = rows.filter((row) => row.status === "Open");
  const charging = openRows.find((row) => row.id === run);
  const due = openRows.filter(dueNow).reduce((sum, row) => sum + row.amount, 0);
  const held = rows.filter((row) => row.status === "Held").reduce((sum, row) => sum + row.amount, 0);
  const repairs = openVisitRepairs(file);

  useEffect(() => {
    rollBills(file.id);
  }, [file.id, file.nextBill, file.retryOn, file.status]);

  const hint = held
    ? "Held with the job or the loan. It is not job revenue."
    : due
      ? `${money(due)} due.`
      : repairs.length
        ? "A repair is still open on a visit."
        : openRows.length
          ? "Nothing due yet."
          : "Nothing open.";

  return (
    <div className="space-y-2">
      <FileBlock title="Card" hint="Saved methods show the last four. The first charge runs the full card.">
        {card ? (
          <p className="text-sm">
            {card.brand} ····{card.last4}
            {card.exp ? ` · ${card.exp}` : ""}
            {card.bank ? ` · ${card.bank}` : ""} · {card.name}
            {card.brand === "ACH" ? "" : ` · ${card.rail === "goodleap" ? "GoodLeap" : "Stripe"}`}
          </p>
        ) : (
          <p className="text-sm text-muted">No card on file yet.</p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => setRun("save")}>
            Replace card
          </button>
        </div>
        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            const result = saveAch(file.id, { bank, last4: ach4, name: achName });
            setAchMiss(result !== "ok");
          }}
        >
          <input value={bank} placeholder="Bank" onChange={(e) => setBank(e.target.value)} className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={ach4} placeholder="Last four" inputMode="numeric" maxLength={4} onChange={(e) => setAch4(e.target.value)} className="h-10 rounded-md border border-line px-3 text-sm" />
          <input value={achName} placeholder="Name on account" onChange={(e) => setAchName(e.target.value)} className="h-10 rounded-md border border-line px-3 text-sm" />
          <button type="submit" className="h-10 rounded-md border border-line px-3 text-sm font-semibold sm:col-span-3 sm:w-fit">
            Save ACH
          </button>
          {achMiss ? <p className="text-sm text-stop sm:col-span-3">Bank, the last four, and the name are required. The full account number is not stored.</p> : null}
        </form>
      </FileBlock>
      <FileBlock title="Invoices" hint={hint} aside={file.planFee ? <p className="text-sm tabular-nums">Fee {money(file.planFee)}</p> : undefined}>
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="text-sm">{row.note}</p>
                <p className={cn("text-[11px] font-semibold", TONE[row.status])}>
                  INV-{row.id} · {row.at} · {row.status === "Open" && !dueNow(row) ? "Open · not due" : row.status}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">{money(row.amount)}</p>
            </li>
          ))}
        </ul>
        {repairs.length ? (
          <div className="border-t border-line pt-3">
            <p className="type-label">Open repairs</p>
            <ul className="mt-2 space-y-1">
              {repairs.map(({ on, repair }) => (
                <li key={repair.id} className="text-sm">
                  {on} · {repair.name || "Repair"} · {money(memberPrice(repair.amount, file.repairDiscount))}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-muted">Charge it on the visit. It is not plan dues.</p>
          </div>
        ) : null}
        {file.retryOn ? <p className="text-sm">Card declined. It comes back {file.retryOn}.</p> : null}
        <div className="flex flex-wrap gap-2">
          {openRows.map((row) => (
            <button key={row.id} type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setRun(row.id)}>
              Run card · {invoiceName(row)} · {money(row.amount)}
            </button>
          ))}
          {held ? (
            <button type="button" className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy" onClick={() => fundHeld(file.id)}>
              {file.funding === "loan" ? "Loan funded" : "Collected with the job"}
            </button>
          ) : null}
        </div>
        {charging ? (
          <PaymentTerminal
            title={invoiceName(charging)}
            amount={charging.amount}
            purpose={`Membership ${invoiceName(charging)} ${file.id}`}
            vault={card?.vaultId ? { vaultId: card.vaultId, brand: card.brand, last4: card.last4, rail: card.rail } : undefined}
            onClose={() => setRun(null)}
            onFailed={(why) => failPayment(file.id, charging.id, /fund/i.test(why) ? "NSF" : "Card declined")}
            onPaid={(slip) => {
              postCardPayment(file.id, charging.id, {
                brand: slip.brand || "Visa",
                last4: slip.last4 || "",
                exp: slip.exp,
                name: slip.name,
                vaultId: slip.vaultId,
                receipt: slip.receipt || "",
                rail: slip.processor === "goodleap" ? "goodleap" : "stripe",
              });
              setRun(null);
            }}
          />
        ) : null}
        {run === "save" ? (
          <PaymentTerminal
            title="Replace card"
            amount={0}
            intent="save"
            purpose={`Replace card ${file.id}`}
            onClose={() => setRun(null)}
            onPaid={(slip) => {
              replaceCard(file.id, {
                brand: slip.brand || "Visa",
                last4: slip.last4 || "",
                exp: slip.exp,
                name: slip.name,
                vaultId: slip.vaultId,
                rail: slip.processor === "goodleap" ? "goodleap" : "stripe",
              });
              setRun(null);
            }}
          />
        ) : null}
      </FileBlock>
    </div>
  );
}