import { Plus } from "lucide-react";
import { money } from "@/lib/crm-data";
import { PriceLines } from "../sold-summary";
import { Float } from "@/components/float";
import { addCustom, addLine, optionRollup, optionTotal, renameOption, unacceptOption } from "../store";
import { cn } from "@/lib/cn";
import { PresentOptionView } from "./part-01";

export function PresentOptionView2(props: { bag: { selected: any; onPick: any; editing: any; proposal: any; option: any; locked: any; setAnchor: any; setMenu: any; menu: any; anchor: any; list: any } }) {
  const { selected, onPick, editing, proposal, option, locked, setAnchor, setMenu, menu, anchor, list } = props.bag;
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
      <PresentOptionView bag={{ option, locked, proposal, editing }} />
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
                setMenu((cur: any) => (cur === kind ? null : kind));
              }}
            >
              <Plus className="size-3.5" />
              {kind}
            </button>
          ))}
          {menu && anchor ? (
            <Float anchor={anchor} prefer="bottom" onClose={() => setMenu(null)}>
              {list.map((p: any) => (
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
