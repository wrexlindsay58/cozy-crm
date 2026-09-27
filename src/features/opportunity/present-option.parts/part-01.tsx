import { useState } from "react";
import { X } from "lucide-react";
import { addersOf, discountsOf, itemBySku, pickFits, productsOf, resolvePicks, useCatalog } from "@/features/catalog/store";
import { isProductLine, lineKey, removeLine, setPick, type OptCard, type Proposal } from "../store";
import { picksOn } from "../proposal-copy";
import { cn } from "@/lib/cn";
import { PresentOptionView2 } from "./part-02";

export function PresentOption({
  proposal,
  option,
  selected,
  onPick,
  editing = false,
}: {
  proposal: Proposal;
  option: OptCard;
  selected: boolean;
  onPick: () => void;
  editing?: boolean;
}) {
  const catalog = useCatalog();
  const locked = !editing || Boolean(proposal.accepted);
  const [menu, setMenu] = useState<"product" | "adder" | "discount" | null>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const have = new Set(option.lines.map((l) => l.sku));
  const list = menu === "product" ? productsOf(catalog) : menu === "adder" ? addersOf(catalog).filter((p) => !p.parent && !have.has(p.sku)) : discountsOf(catalog).filter((p) => !have.has(p.sku));

  return (
    <PresentOptionView2 bag={{ selected, onPick, editing, proposal, option, locked, setAnchor, setMenu, menu, anchor, list }} />
  );
}

export function PresentOptionView(props: { bag: { option: any; locked: any; proposal: any; editing: any } }) {
  const { option, locked, proposal, editing } = props.bag;
  return (
    <ul className="mt-4 space-y-3">
        {option.lines.filter(isProductLine).map((l: any) => {
          const item = itemBySku((l.sku.split("@")[0] ?? l.sku));
          const chosen = item ? resolvePicks(item, l.picks) : {};
          const choices = (item?.choices ?? []).map((ch) => ({
            ...ch,
            picks: ch.picks.filter((p) => pickFits(p, chosen)),
            value: chosen[ch.id] ?? "",
          }));
          return (
            <li key={lineKey(l)} className="border-t border-current/15 pt-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">
                  {l.label}
                  {picksOn(l) ? <span className="opacity-70"> · {picksOn(l)}</span> : null}
                </span>
                {!locked ? (
                  <button type="button" aria-label={`Take off ${l.label}`} className="grid size-8 place-items-center opacity-70 hover:opacity-100" onClick={() => removeLine(proposal.oppId, option.id, lineKey(l))}>
                    <X className="size-3.5" />
                  </button>
                ) : null}
              </div>
              {editing && choices.length ? (
                <div className={cn("mt-2 grid gap-2", choices.length > 1 && "sm:grid-cols-2")}>
                  {choices.map((ch) => (
                    <label key={ch.id} className="min-w-[7rem] flex-1 text-[10px] font-bold tracking-[0.16em] uppercase opacity-70" style={{ fontFamily: "var(--p-sub)" }}>
                      {ch.label}
                      <select
                        disabled={locked || ch.picks.length === 0}
                        value={ch.picks.some((p) => p.id === ch.value) ? ch.value : ""}
                        onChange={(e) => setPick(proposal.oppId, option.id, lineKey(l), ch.id, e.target.value)}
                        className="mt-1 h-10 w-full rounded-sm border border-[var(--p-navy)]/20 bg-white px-2 text-sm font-semibold normal-case tracking-normal text-[var(--p-navy)]"
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
              <ul className="mt-2 space-y-2 border-l border-current/15 pl-3">
                {option.lines
                  .filter((child: any) => child.appliesTo === lineKey(l) && (child.kind === "adder" || child.adder))
                  .map((child: any) => (
                    <li key={lineKey(child)} className="text-sm">
                      {child.label}
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
        {option.lines
          .filter((l: any) => !isProductLine(l) && !l.appliesTo && (l.kind === "adder" || l.adder))
          .map((l: any) => (
            <li key={lineKey(l)} className="border-t border-current/15 pt-3 text-sm">
              {l.label}
            </li>
          ))}
      </ul>
  );
}
