import { useState } from "react";
import { Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addersOf, discountsOf, itemBySku, pickFits, productsOf, rebatesOf, resolvePicks, useCatalog } from "@/features/catalog/store";
import { isProductLine, lineAmount, lineKey, optionTotal, removeLine, setPick, setQty, type OptCard, type OptLine, type Proposal } from "../store";
import { cn } from "@/lib/cn";
import { OptionCardView2 } from "./part-03";

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
    <OptionCardView2 bag={{ accepted, option, locked, proposal, total, productLines, open, general, menu, anchor, setMenu, products, adders, rebates, discs, placeOn, custom, customAmt, customWhen, setCustom, setCustomAmt, setCustomWhen }} />
  );
}

export function LineRow({
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
