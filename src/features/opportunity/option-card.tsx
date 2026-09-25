import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addersOf, discountsOf, itemBySku, pickFits, productsOf, rebatesOf, resolvePicks, useCatalog } from "@/features/catalog/store";
import { Float } from "@/components/float";
import { addCustom, addLine, isProductLine, lineAmount, lineKey, optionTotal, removeLine, removeOption, renameOption, setPick, setQty, type OptCard, type OptLine, type Proposal } from "./store";
import { cn } from "@/lib/cn";
import { PayOnOption } from "./pay-on-option";

type Menu = "product" | "adder" | "discount" | "rebate" | null;

export function OptionCard({ proposal, option }: { proposal: Proposal; option: OptCard }) {
  const accepted = proposal.accepted === option.id;
  const locked = Boolean(proposal.accepted);
  const total = optionTotal(option);
  const catalog = useCatalog();
  const [menu, setMenu] = useState<Menu>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const [placeOn, setPlaceOn] = useState<string | undefined>();
  const [parentSku, setParentSku] = useState<string | undefined>();
  const [custom, setCustom] = useState("");
  const [customAmt, setCustomAmt] = useState("");
  const [customWhen, setCustomWhen] = useState<"pos" | "after">("after");

  function open(next: Menu, el: HTMLElement, place?: string, parent?: string) {
    setAnchor(el.getBoundingClientRect());
    setPlaceOn(place);
    setParentSku(parent);
    setMenu((cur) => (cur === next && placeOn === place ? null : next));
    setCustom("");
    setCustomAmt("");
  }

  const products = productsOf(catalog);
  const adders = addersOf(catalog).filter((p) => {
    const onThis = (l: OptLine) => (placeOn ? l.appliesTo === placeOn : !l.appliesTo) && (l.sku === p.sku || l.sku.startsWith(`${p.sku}@`));
    if (placeOn) return p.parent === parentSku && !option.lines.some(onThis);
    return !p.parent && !option.lines.some(onThis);
  });
  const discs = discountsOf(catalog).filter((p) => !option.lines.some((l) => (placeOn ? l.appliesTo === placeOn : !l.appliesTo) && (l.sku === p.sku || l.sku.startsWith(`${p.sku}@`))));
  const rebates = rebatesOf(catalog).filter((p) => !option.lines.some((l) => (placeOn ? l.appliesTo === placeOn : !l.appliesTo) && (l.sku === p.sku || l.sku.startsWith(`${p.sku}@`))));
  const productLines = option.lines.filter(isProductLine);
  const general = option.lines.filter((l) => !isProductLine(l) && !l.appliesTo);

  return (
    <article className={cn("flex flex-col rounded-md border bg-card p-4", accepted ? "border-navy bg-info-bg/40 ring-1 ring-navy" : "border-line")}>
      <div className="mb-3 flex items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{accepted ? "Sold option" : "Option name"}</span>
          <input
            value={option.name}
            disabled={locked}
            onChange={(e) => renameOption(proposal.oppId, option.id, e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm font-semibold text-ink outline-none"
          />
        </label>
        <p className="flex h-10 items-center text-lg font-extrabold text-navy tabular-nums">{money(total)}</p>
        {!locked && proposal.options.length > 1 ? (
          <button type="button" aria-label="Remove option" className="grid size-10 shrink-0 place-items-center text-muted hover:text-alert" onClick={() => removeOption(proposal.oppId, option.id)}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ul className="space-y-3">
        {productLines.map((l) => (
          <li key={lineKey(l)}>
            <LineRow proposal={proposal} option={option} line={l} locked={locked} accepted={accepted} />
            <ul className="mt-1 space-y-1 border-l border-line pl-3">
              {option.lines
                .filter((child) => child.appliesTo === lineKey(l))
                .map((child) => (
                  <LineRow key={lineKey(child)} proposal={proposal} option={option} line={child} locked={locked} accepted={accepted} />
                ))}
            </ul>
            {!locked ? (
              <div className="mt-1 flex flex-wrap gap-3 pl-3">
                <button type="button" className="h-8 text-sm font-semibold text-navy" onClick={() => addLine(proposal.oppId, option.id, l.sku)}>
                  {l.sku === "ducts" ? "+ Scope" : "+ Another"}
                </button>
                <button type="button" className="h-8 text-sm font-semibold text-navy" onClick={(e) => open("adder", e.currentTarget, lineKey(l), l.sku)}>
                  + Adder
                </button>
                <button type="button" className="h-8 text-sm font-semibold text-navy" onClick={(e) => open("discount", e.currentTarget, lineKey(l), l.sku)}>
                  + Discount
                </button>
                <button type="button" className="h-8 text-sm font-semibold text-navy" onClick={(e) => open("rebate", e.currentTarget, lineKey(l), l.sku)}>
                  + Rebate
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {general.length ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="type-label">On the whole option</p>
          <ul className="mt-2 space-y-1">
            {general.map((l) => (
              <LineRow key={lineKey(l)} proposal={proposal} option={option} line={l} locked={locked} accepted={accepted} />
            ))}
          </ul>
        </div>
      ) : null}
      <PayOnOption proposal={proposal} option={option} />
      {!locked ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["product", "adder", "discount", "rebate"] as const).map((kind) => (
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
              {(menu === "product" ? products : menu === "adder" ? adders : menu === "rebate" ? rebates : discs).map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  className="flex h-10 w-full min-w-56 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
                  onClick={() => {
                    addLine(proposal.oppId, option.id, p.sku, placeOn);
                    setMenu(null);
                  }}
                >
                  <span>{p.label}</span>
                  <span className="tabular-nums text-muted">
                    {p.rebate ? (p.rebateWhen === "pos" ? "At sale · " : "After · ") : ""}
                    {p.pct ? `${p.pct}%` : money(Math.abs(p.sell))}
                  </span>
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
                      kind: menu === "adder" ? "adder" : "discount",
                      rebate: menu === "rebate",
                      rebateWhen: customWhen,
                      appliesTo: placeOn,
                    });
                    setMenu(null);
                  }}
                >
                  <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={menu === "adder" ? "Custom adder" : menu === "rebate" ? "Custom rebate" : "Custom discount"} className="h-10 min-w-0 flex-1 rounded-md border border-line px-2 text-sm" />
                  <input value={customAmt} onChange={(e) => setCustomAmt(e.target.value)} placeholder="$" inputMode="numeric" className="h-10 w-20 rounded-md border border-line px-2 text-sm" />
                  {menu === "rebate" ? (
                    <select value={customWhen} onChange={(e) => setCustomWhen(e.target.value as "pos" | "after")} className="h-10 rounded-md border border-line px-2 text-sm">
                      <option value="after">After</option>
                      <option value="pos">At sale</option>
                    </select>
                  ) : null}
                  <button type="submit" className="h-10 rounded-md bg-navy px-2 text-xs font-semibold text-card">
                    Add
                  </button>
                </form>
              ) : null}
            </Float>
          ) : null}
        </div>
      ) : null}
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
  const item = itemBySku(line.sku.split("@")[0] ?? line.sku);
  const chosen = item ? resolvePicks(item, line.picks) : {};
  const choices = (item?.choices ?? []).map((ch) => ({
    ...ch,
    picks: ch.picks.filter((p) => pickFits(p, chosen)),
    value: chosen[ch.id] ?? "",
  }));
  const amount = line.kind === "discount" && line.pct ? `-${line.pct}%` : money(lineAmount(line) || line.unit * line.qty);
  return (
    <div className="rounded-md bg-page px-2 py-2">
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
            onChange={(e) => setQty(proposal.oppId, option.id, lineKey(line), Number(e.target.value))}
            className={cn("h-9 w-12 rounded border px-1 text-center text-sm tabular-nums", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card")}
          />
        ) : null}
        <span className="w-20 text-right tabular-nums">{amount}</span>
        {!locked ? (
          <button type="button" aria-label={`Take off ${line.label}`} className="grid size-8 place-items-center text-muted hover:text-alert" onClick={() => removeLine(proposal.oppId, option.id, lineKey(line))}>
            <Trash2 className="size-3.5" />
          </button>
        ) : null}
      </div>
      {choices.length ? (
        <div className={cn("mt-2 grid gap-2", choices.length > 1 && "sm:grid-cols-2")}>
          {choices.map((ch) => (
            <label key={ch.id} className="min-w-[8rem] flex-1 text-[11px] font-bold tracking-wide text-muted uppercase">
              {ch.label}
              <select
                disabled={locked || ch.picks.length === 0}
                value={ch.picks.some((p) => p.id === ch.value) ? ch.value : ""}
                onChange={(e) => setPick(proposal.oppId, option.id, lineKey(line), ch.id, e.target.value)}
                className={cn("mt-1 h-10 w-full rounded-md border px-2 text-sm font-semibold normal-case tracking-normal", accepted ? "border-card/40 bg-navy text-card" : "border-line bg-card text-ink")}
              >
                {ch.picks.length === 0 ? <option value="">None for this size</option> : null}
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
    </div>
  );
}
