import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { formatPan } from "../card";
import { RAIL_LABEL } from "../rails";
import { input } from "./part-01";

export function CardChargeView(props: { bag: { charge: any; setRail: any; rail: any; card: any; setCard: any; bad: any; miss: any; reason: any; busy: any; intent: any; amount: any; vault: any; onCancel: any } }) {
  const { charge, setRail, rail, card, setCard, bad, miss, reason, busy, intent, amount, vault, onCancel } = props.bag;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void charge();
      }}
    >
      <div className="mb-3 flex gap-1">
        {(["stripe", "goodleap"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRail(item)}
            className={rail === item ? "h-9 flex-1 rounded-md border border-navy bg-info-bg text-sm font-semibold text-navy" : "h-9 flex-1 rounded-md border border-line text-sm font-semibold text-muted"}
          >
            {RAIL_LABEL[item]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Name on card</span>
          <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} autoComplete="cc-name" className={cn(input, bad("name") ? "border-stop" : "border-line")} />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Card number</span>
          <input
            value={card.pan}
            onChange={(e) => setCard({ ...card, pan: formatPan(e.target.value) })}
            inputMode="numeric"
            autoComplete="cc-number"
            className={cn(input, "tabular-nums", bad("pan") ? "border-stop" : "border-line")}
          />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Expires</span>
          <input value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} placeholder="MM/YY" autoComplete="cc-exp" className={cn(input, bad("exp") ? "border-stop" : "border-line")} />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Security code</span>
          <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} inputMode="numeric" autoComplete="cc-csc" className={cn(input, bad("cvc") ? "border-stop" : "border-line")} />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">ZIP</span>
          <input value={card.zip} onChange={(e) => setCard({ ...card, zip: e.target.value.replace(/\D/g, "").slice(0, 5) })} inputMode="numeric" autoComplete="postal-code" className={cn(input, bad("zip") ? "border-stop" : "border-line")} />
        </label>
      </div>
      {miss.length ? <p className="mt-3 text-sm text-stop">The highlighted fields have to be a real card before this can run.</p> : null}
      {reason ? <p className="mt-3 text-sm text-stop">{reason}</p> : null}
      <p className="mt-3 text-sm text-muted">
        {rail === "stripe"
          ? "The full number is sent to Stripe for this charge and is not stored. A saved method keeps the last four only."
          : "Same card fields. GoodLeap Payments is not connected, so this card is not sent and nothing is charged."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={busy} className="h-11 rounded-md bg-navy px-4 text-sm font-semibold text-card disabled:opacity-50">
          {busy ? (intent === "save" ? "Saving…" : "Charging…") : intent === "save" ? "Save card" : `Charge ${money(amount)}`}
        </button>
        {intent === "charge" && vault && (vault.rail ?? "stripe") === rail ? (
          <button type="button" disabled={busy} className="h-11 rounded-md border border-navy px-4 text-sm font-semibold text-navy disabled:opacity-50" onClick={() => void charge({ vaultId: vault.vaultId })}>
            Charge {vault.brand} ····{vault.last4}
          </button>
        ) : null}
        {onCancel ? (
          <button type="button" className="h-11 px-3 text-sm font-semibold text-muted" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
