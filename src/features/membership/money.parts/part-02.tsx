import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { FileBlock } from "@/features/record-shell/file-sheet";
import { PaymentTerminal } from "@/features/pay/terminal";
import { failPayment, fundHeld, memberPrice, postCardPayment, replaceCard } from "../store";
import { TONE, invoiceName, dueNow } from "./part-01";

export function MembershipMoneyView(props: { bag: { hint: any; file: any; rows: any; repairs: any; openRows: any; setRun: any; held: any; charging: any; card: any; run: any } }) {
  const { hint, file, rows, repairs, openRows, setRun, held, charging, card, run } = props.bag;
  return (
    <FileBlock title="Invoices" hint={hint} aside={file.planFee ? <p className="text-sm tabular-nums">Fee {money(file.planFee)}</p> : undefined}>
        <ul className="divide-y divide-line">
          {rows.map((row: any) => (
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
              {repairs.map(({ on, repair }: { on: string; repair: { id: string; name: string; amount: number } }) => (
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
          {openRows.map((row: any) => (
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
  );
}
