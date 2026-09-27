import type { ReactNode } from "react";
import { Layers, Check, PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { ICONS, paneEl, useFileSections, type FileSection, write_paneEl } from "./part-01";
import { FileSectionsView } from "./part-03";

export function FileSections({
  sections,
  layout = "swap",
  banner,
  start,
  advance,
}: {
  sections: FileSection[];
  layout?: "swap" | "stack";
  banner?: ReactNode;
  start?: string;
  advance?: { pipeline: string; onContinue: () => void };
}) {
  const { items, setActive, paneRef, foot, slim, next, setSlim, current, prev, onLast, ready } = useFileSections(sections, layout, banner, start, advance);


  if (items.length === 0) return null;

  function go(id: string) {
    setActive(id);
    paneRef.current?.scrollTo({ top: 0 });
  }

  if (layout === "stack") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          ref={(n) => {
            paneRef.current = n;
            write_paneEl(n);
          }}
          className="min-h-0 flex-1 space-y-2 overflow-auto overscroll-none p-2 md:p-2.5"
        >
          {items.map((s) => (
            <div key={s.id} id={`sec-${s.id}`}>
              {s.node}
            </div>
          ))}
          {foot}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row lg:contents">
      <aside className={cn("hidden shrink-0 flex-col overflow-auto border-r border-line bg-card md:flex lg:col-start-1 lg:row-start-1", slim ? "w-12" : "w-[198px]")}>
        <div className={cn("flex items-center border-b border-line", slim ? "justify-center px-0 py-2" : "justify-between px-2 py-2")}>
          {slim ? null : <p className="px-1 text-[10px] font-bold tracking-[0.14em] text-muted uppercase">On this file</p>}
          <Tip label={slim ? "Open menu" : "Collapse menu"} on>
            <button
              type="button"
              aria-label={slim ? "Open menu" : "Collapse menu"}
              className="grid size-8 place-items-center rounded-md text-muted hover:bg-page hover:text-navy"
              onClick={() => {
                const next = !slim;
                setSlim(next);
                try {
                  localStorage.setItem("cozy.fileRail", next ? "slim" : "open");
                } catch {
                  /* ignore */
                }
              }}
            >
              {slim ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </Tip>
        </div>
        {items.map((s) => (
          <RailBtn key={s.id} section={s} active={s.id === current?.id} slim={slim} onClick={() => go(s.id)} />
        ))}
      </aside>

      <FileSectionsView bag={{ items, go, current, banner, paneRef, prev, onLast, advance, ready, next }} />
    </div>
  );
}

function RailBtn({
  section: s,
  active,
  slim,
  onClick,
}: {
  section: FileSection;
  active: boolean;
  slim?: boolean;
  onClick: () => void;
}) {
  const Icon = s.icon ?? ICONS[s.id] ?? Layers;
  const open = Boolean(s.started) && !s.done;
  const tip = [s.label, s.done ? "Complete" : open ? "Started" : "", s.doneAt].filter(Boolean).join(" · ");
  const Mark = s.done ? Check : null;
  const btn = (
    <button
      type="button"
      onClick={onClick}
      aria-label={tip}
      className={cn(
        "flex h-9 w-full shrink-0 items-center text-left text-sm",
        slim ? "justify-center px-0" : "gap-2.5 px-3",
        active ? "bg-navy font-semibold text-card" : s.done ? "text-navy hover:bg-page" : "text-ink hover:bg-page",
      )}
    >
      <span className="relative grid size-4 shrink-0 place-items-center">
        <Icon className={cn("size-4", active ? "text-card" : s.done || open ? "text-navy" : "text-muted")} />
        {slim && Mark ? <Mark className="absolute -right-1.5 -bottom-1 size-2.5 text-up" strokeWidth={3} /> : null}
      </span>
      {slim ? null : <span className="min-w-0 flex-1 truncate">{s.label}</span>}
      {slim || !Mark ? null : <Mark className={cn("size-3.5 shrink-0", active ? "text-card" : "text-up")} strokeWidth={2.5} />}
    </button>
  );
  return slim ? (
    <Tip label={tip} on className="w-full">
      {btn}
    </Tip>
  ) : (
    btn
  );
}
