import { Plus } from "lucide-react";
import { money } from "@/lib/crm-data";
import { Float } from "@/components/float";
import { addCustom, addLine } from "../store";

export function OptionCardView(props: { bag: { open: any; menu: any; anchor: any; setMenu: any; products: any; adders: any; rebates: any; discs: any; proposal: any; option: any; placeOn: any; custom: any; customAmt: any; customWhen: any; setCustom: any; setCustomAmt: any; setCustomWhen: any } }) {
  const { open, menu, anchor, setMenu, products, adders, rebates, discs, proposal, option, placeOn, custom, customAmt, customWhen, setCustom, setCustomAmt, setCustomWhen } = props.bag;
  return (
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
              {(menu === "product" ? products : menu === "adder" ? adders : menu === "rebate" ? rebates : discs).map((p: any) => (
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
  );
}
