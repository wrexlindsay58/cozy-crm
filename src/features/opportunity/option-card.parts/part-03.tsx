import { Trash2 } from "lucide-react";
import { money } from "@/lib/crm-data";
import { addLine, lineKey, removeOption, renameOption } from "../store";
import { cn } from "@/lib/cn";
import { PayOnOption } from "../pay-on-option";
import { LineRow } from "./part-01";
import { OptionCardView } from "./part-02";

export function OptionCardView2(props: { bag: { accepted: any; option: any; locked: any; proposal: any; total: any; productLines: any; open: any; general: any; menu: any; anchor: any; setMenu: any; products: any; adders: any; rebates: any; discs: any; placeOn: any; custom: any; customAmt: any; customWhen: any; setCustom: any; setCustomAmt: any; setCustomWhen: any } }) {
  const { accepted, option, locked, proposal, total, productLines, open, general, menu, anchor, setMenu, products, adders, rebates, discs, placeOn, custom, customAmt, customWhen, setCustom, setCustomAmt, setCustomWhen } = props.bag;
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
        <p className="flex h-8 items-center text-base font-extrabold text-navy tabular-nums md:h-10 md:text-lg">{money(total)}</p>
        {!locked && proposal.options.length > 1 ? (
          <button type="button" aria-label="Remove option" className="grid size-8 shrink-0 place-items-center text-muted hover:text-alert md:size-10" onClick={() => removeOption(proposal.oppId, option.id)}>
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>
      <ul className="space-y-3">
        {productLines.map((l: any) => (
          <li key={lineKey(l)}>
            <LineRow proposal={proposal} option={option} line={l} locked={locked} accepted={accepted} />
            <ul className="mt-1 space-y-1 border-l border-line pl-3">
              {option.lines
                .filter((child: any) => child.appliesTo === lineKey(l))
                .map((child: any) => (
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
            {general.map((l: any) => (
              <LineRow key={lineKey(l)} proposal={proposal} option={option} line={l} locked={locked} accepted={accepted} />
            ))}
          </ul>
        </div>
      ) : null}
      <PayOnOption proposal={proposal} option={option} />
      {!locked ? (
        <OptionCardView bag={{ open, menu, anchor, setMenu, products, adders, rebates, discs, proposal, option, placeOn, custom, customAmt, customWhen, setCustom, setCustomAmt, setCustomWhen }} />
      ) : null}
    </article>
  );
}
