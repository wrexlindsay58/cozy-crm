import { useState } from "react";
import { Plus, X } from "lucide-react";
import { money } from "@/lib/crm-data";
import { PriceLines } from "./sold-summary";
import { addersOf, discountsOf, itemBySku, pickFits, productsOf, resolvePicks, useCatalog } from "@/features/catalog/store";
import { Float } from "@/components/float";
import { acceptOption, addCustom, addLine, isProductLine, lineKey, optionRollup, optionTotal, removeLine, renameOption, setPick, unacceptOption, type OptCard, type Proposal } from "./store";
import { picksOn } from "./proposal-copy";
import { cn } from "@/lib/cn";

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
    <article className={cn("rounded-sm border bg-white p-5 text-[var(--p-navy)]", selected ? "border-[var(--p-navy)]" : "border-[var(--p-trim)]")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button type="button" onClick={onPick} className="min-w-0 flex-1 text-left">
          {editing && !proposal.accepted ? (
            <input
              value={option.name}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => renameOption(proposal.oppId, option.id, e.target.value)}
              className="h-10 w-full bg-transparent text-3xl uppercase text-[var(--p-navy)] outline-none"
              style={{ fontFamily: "var(--p-head)" }}
            />
          ) : (
            <h3 className="text-3xl uppercase" style={{ fontFamily: "var(--p-head)" }}>
              {option.name}
            </h3>
          )}
        </button>
        <p className="text-3xl font-extrabold tabular-nums" style={{ fontFamily: "var(--p-head)" }}>
          {money(optionTotal(option))}
        </p>
      </div>
      <ul className="mt-4 space-y-3">
        {option.lines.filter(isProductLine).map((l) => {
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
                  .filter((child) => child.appliesTo === lineKey(l) && (child.kind === "adder" || child.adder))
                  .map((child) => (
                    <li key={lineKey(child)} className="text-sm">
                      {child.label}
                    </li>
                  ))}
              </ul>
            </li>
          );
        })}
        {option.lines
          .filter((l) => !isProductLine(l) && !l.appliesTo && (l.kind === "adder" || l.adder))
          .map((l) => (
            <li key={lineKey(l)} className="border-t border-current/15 pt-3 text-sm">
              {l.label}
            </li>
          ))}
      </ul>
      <PriceLines roll={optionRollup(option)} />
      {!locked ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {(["product", "adder", "discount"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              className="inline-flex h-10 items-center gap-1 rounded-sm border border-[var(--p-navy)]/20 px-3 text-xs font-semibold uppercase tracking-wider"
              style={{ fontFamily: "var(--p-sub)" }}
              onClick={(e) => {
                setAnchor(e.currentTarget.getBoundingClientRect());
                setMenu((cur) => (cur === kind ? null : kind));
              }}
            >
              <Plus className="size-3.5" />
              {kind}
            </button>
          ))}
          {menu && anchor ? (
            <Float anchor={anchor} prefer="bottom" onClose={() => setMenu(null)}>
              {list.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  className="flex h-10 w-full min-w-52 items-center justify-between gap-3 px-3 text-sm hover:bg-page"
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
                <button
                  type="button"
                  className="flex h-10 w-full items-center px-3 text-sm hover:bg-page"
                  onClick={() => {
                    addCustom(proposal.oppId, option.id, { label: menu === "adder" ? "Custom adder" : "Custom off", unit: menu === "adder" ? 500 : 250, kind: menu });
                    setMenu(null);
                  }}
                >
                  Custom {menu}
                </button>
              ) : null}
            </Float>
          ) : null}
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {proposal.accepted === option.id && editing ? (
          <button type="button" className="h-11 flex-1 rounded-sm border-2 border-[var(--p-navy)] text-sm font-semibold" onClick={() => unacceptOption(proposal.oppId)}>
            Undo this pick
          </button>
        ) : (
          <button
            type="button"
            className="h-11 flex-1 bg-[var(--p-navy)] text-sm font-semibold text-white"
            onClick={() => {
              if (proposal.accepted && proposal.accepted !== option.id) unacceptOption(proposal.oppId);
              onPick();
            }}
          >
            {proposal.accepted && proposal.accepted !== option.id ? "Use this instead" : selected ? "This is the pick" : "Select this option"}
          </button>
        )}
      </div>
    </article>
  );
}
