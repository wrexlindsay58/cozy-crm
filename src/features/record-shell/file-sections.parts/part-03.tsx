import { Layers, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { ICONS, paneEl, write_paneEl } from "./part-01";

export function FileSectionsView(props: { bag: { items: any; go: any; current: any; banner: any; paneRef: any; prev: any; onLast: any; advance: any; ready: any; next: any } }) {
  const { items, go, current, banner, paneRef, prev, onLast, advance, ready, next } = props.bag;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:col-start-2 lg:row-start-1">
        <nav className="flex shrink-0 items-center gap-1 overflow-hidden border-b border-line bg-card px-1.5 py-1.5 md:hidden">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {items.map((s: any) => {
              const Icon = s.icon ?? ICONS[s.id] ?? Layers;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(s.id)}
                  className={cn(
                    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold",
                    s.id === current?.id ? "bg-navy text-card" : s.done ? "text-navy" : "text-muted hover:text-navy",
                  )}
                >
                  <Icon className="size-3.5" />
                  {s.label}
                  {s.done ? <Check className="size-3 text-up" strokeWidth={2.5} /> : null}
                </button>
              );
            })}
          </div>
        </nav>

        {banner ? <div className="shrink-0 border-b border-line">{banner}</div> : null}

        <div
          ref={(n) => {
            paneRef.current = n;
            write_paneEl(n);
          }}
          className="min-h-0 flex-1 overflow-auto overscroll-none p-2 md:p-2.5"
        >
          <div id={`sec-${current?.id}`}>{current?.node}</div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line bg-card px-2 py-1.5">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && go(prev.id)}
            className={cn("h-9 px-2 text-sm font-semibold", prev ? "text-navy" : "text-muted")}
          >
            Back
          </button>
          {current?.id === "book" || current?.id === "media" ? (
            <span />
          ) : onLast && advance ? (
            <Tip label={ready ? `Open the ${advance.pipeline.toLowerCase()}` : "Finish this pipeline first"} on>
              <button
                type="button"
                disabled={!ready}
                onClick={advance.onContinue}
                className={cn("h-9 rounded-md px-3 text-sm font-semibold", ready ? "bg-navy text-card" : "bg-page text-muted")}
              >
                Continue to {advance.pipeline}
              </button>
            </Tip>
          ) : current?.action ? (
            <button
              type="button"
              disabled={current.action.ready === false}
              onClick={current.action.onClick}
              className={cn(
                "h-9 rounded-md px-3 text-sm font-semibold",
                current.action.ready === false ? "bg-page text-muted" : "bg-navy text-card",
              )}
            >
              {current.action.label}
            </button>
          ) : next ? (
            <button type="button" onClick={() => go(next.id)} className="h-9 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Next
            </button>
          ) : (
            <span className="h-9 px-2 text-sm text-muted">End</span>
          )}
        </div>
      </div>
  );
}
