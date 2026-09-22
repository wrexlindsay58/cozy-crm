import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addersOf, discountsOf, itemBySku, productsOf, useCatalog } from "@/features/catalog/store";
import { Float } from "@/components/float";
import { acceptOption, addCustom, addLine, lineAmount, optionTotal, removeLine, removeOption, renameOption, setPick, setQty, unacceptOption, type OptCard, type OptLine, type Proposal } from "./store";
import { cn } from "@/lib/cn";
import { PayOnOption } from "./pay-on-option";

type Menu = "product" | "adder" | "discount" | null;

export function OptionCard({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const accepted = proposal.accepted === option.id;
  const locked = Boolean(proposal.accepted);
  const total = optionTotal(option);
  const catalog = useCatalog();
  const [menu, setMenu] = useState<Menu>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [custom, setCustom] = useState("");
  const [customAmt, setCustomAmt] = useState("");

  function open(next: Menu, el: HTMLElement) {
    setAnchor(el.getBoundingClientRect());
    setMenu((cur) => (cur === next ? null : next));
    setCustom("");
    setCustomAmt("");
  }

  const have = new Set(option.lines.map((l) => l.sku));
  const products = productsOf(catalog).filter((p) => !have.has(p.sku));
  const adders = addersOf(catalog).filter((p) => !have.has(p.sku));
  const discs = discountsOf(catalog).filter((p) => !have.has(p.sku));

  return (
    <article className={cn("flex flex-col rounded-md border bg-card p-4", accepted ? "border-navy bg-info-bg/40 ring-1 ring-navy" : "border-line")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <label className="min-w-0 flex-1 text-[11px] font-bold tracking-wide text-muted uppercase">
          {accepted ? "Sold option" : "Option name"}
          <input
            value={option.name}
            disabled={locked}
            onChange={(e) => renameOption(proposal.oppId, option.id, e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm font-semibold normal-case tracking-normal text-ink outline-none"
          />
        </label>
        <p className="text-lg font-extrabold tabular-nums">{money(total)}</p>
        {!locked && proposal.options.length > 1 ? (
          <button type="button" aria-label="Remove option" className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removeOption(proposal.oppId, option.id)}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ul className="space-y-2">
        {option.lines.map((l) => (
          <LineRow key={l.sku} proposal={proposal} option={option} line={l} locked={locked} accepted={accepted} />
        ))}
      </ul>
      <PayOnOption proposal={proposal} option={option} />
      {!locked ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["product", "adder", "discount"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-md border border-line px-3 text-sm font-semibold capitalize"
              onClick={(e) => open(kind, e.currentTarget)}
            >
              <Plus className="size-4" />
              {kind}
            </button>
          ))}
          {menu && anchor ? (
            <Float anchor={anchor} prefer="bottom" onClose={() => setMenu(null)}>
              {(menu === "product" ? products : menu === "adder" ? adders : discs).map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  className="flex h-10 w-full min-w-56 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
                  onClick={() => {
                    addLine(proposal.oppId, option.id, p.sku);
                    setMenu(null);
                  }}
                >
                  <span>{p.label}</span>
                  <span className="tabular-nums text-muted">{p.pct ? `${p.pct}%` : money(p.sell)}</span>
                </button>
              ))}
              {menu !== "product" ? (
                <form
                  className="flex gap-1 border-t border-line p-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCustom(proposal.oppId, option.id, {
                      label: custom,
                      unit: Number(customAmt) || 0,
                      kind: menu,
                    });
                    setMenu(null);
                  }}
                >
                  <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={menu === "adder" ? "Custom adder" : "Custom discount"} className="h-10 min-w-0 flex-1 rounded-md border border-line px-2 text-sm" />
                  <input value={customAmt} onChange={(e) => setCustomAmt(e.target.value)} placeholder="$" inputMode="numeric" className="h-10 w-20 rounded-md border border-line px-2 text-sm" />
                  <button type="submit" className="h-10 rounded-md bg-navy px-2 text-xs font-semibold text-card">
                    Add
                  </button>
                </form>
              ) : null}
            </Float>
          ) : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => (accepted ? unacceptOption(proposal.oppId) : acceptOption(proposal.oppId, option.id))}
        className={cn("mt-4 h-11 rounded-md text-sm font-semibold", accepted ? "bg-navy text-card" : "border border-line hover:border-navy")}
      >
        {accepted ? "Undo this pick" : "Accept this option"}
      </button>
    </article>
  );
}

function LineRow({
  proposal,
  option,
  line,
  locked,
  accepted,
}: {
  proposal: Proposal;
  option: OptCard;
  line: OptLine;
  locked: boolean;
  accepted: boolean;
}) {
  const item = itemBySku(line.sku);
  const choices = item?.choices ?? [];
  const amount = line.kind === "discount" && line.pct ? `-${line.pct}%` : money(lineAmount(line) || line.unit * line.qty);
  return (
    <li className="rounded-md bg-page px-2 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="min-w-0 flex-1">
          {line.label}
          {line.kind === "adder" || line.adder ? <span className={accepted ? "text-card/70" : "text-muted"}> · adder</span> : null}
          {line.kind === "discount" ? <span className={accepted ? "text-card/70" : "text-muted"}> · off</span> : null}
        </span>
        {line.kind !== "discount" ? (
          <input
            type="number"
            min={1}
            max={99}
            disabled={locked}
            value={line.qty}
            onChange={(e) => setQty(proposal.oppId, option.id, line.sku, Number(e.target.value))}
            className={cn("h-9 w-12 rounded border px-1 text-center text-sm tabular-nums", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card")}
          />
        ) : null}
        <span className="w-20 text-right tabular-nums">{amount}</span>
        {!locked ? (
          <button type="button" aria-label={`Take off ${line.label}`} className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removeLine(proposal.oppId, option.id, line.sku)}>
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
      {choices.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {choices.map((ch) => (
            <label key={ch.id} className="min-w-[8rem] flex-1 text-[11px] font-bold tracking-wide text-muted uppercase">
              {ch.label}
              <select
                disabled={locked}
                value={line.picks?.[ch.id] ?? ch.picks[0]?.id}
                onChange={(e) => setPick(proposal.oppId, option.id, line.sku, ch.id, e.target.value)}
                className={cn("mt-1 h-10 w-full rounded-md border px-2 text-sm font-semibold normal-case tracking-normal", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card text-ink")}
              >
                {ch.picks.map((pk) => (
                  <option key={pk.id} value={pk.id}>
                    {pk.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}
    </li>
  );
}
