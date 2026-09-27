import { useEffect, useState } from "react";
import { money } from "@/lib/crm-data";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { parseDay } from "../renew";
import { rollBills, saveAch } from "../store";
import { openVisitRepairs } from "../visits";
import type { LedgerRow, MembershipFile } from "../types";
import { MembershipMoneyView } from "./part-02";

export const TONE: Record<string, string> = {
  Paid: "text-up",
  Open: "text-navy",
  Failed: "text-alert",
  Held: "text-muted",
};

export function invoiceName(row: LedgerRow) {
  const note = row.note.replace(/\.$/, "").split(".")[0]?.trim();
  return note || "Invoice";
}

export function dueNow(row: LedgerRow) {
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
      <MembershipMoneyView bag={{ hint, file, rows, repairs, openRows, setRun, held, charging, card, run }} />
    </div>
  );
}
