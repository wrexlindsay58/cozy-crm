import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AppWindow,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Fan,
  FileText,
  FileSignature,
  GitMerge,
  HardHat,
  House,
  Image,
  Layers,
  LayoutList,
  ListOrdered,
  type LucideIcon,
  Spline,
  Star,
  UserRound,
  Wind,
  Wrench,
  CircleDollarSign,
  Flag,
  Ruler,
  ClipboardCheck,
  Check,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";

export type FileSection = {
  id: string;
  label: string;
  node: ReactNode;
  done?: boolean;
  started?: boolean;
  doneAt?: string;
  icon?: LucideIcon;
  action?: { label: string; onClick: () => void; ready?: boolean };
};

const ICONS: Record<string, LucideIcon> = {
  contact: UserRound,
  lead: UserRound,
  details: UserRound,
  qualify: BadgeCheck,
  book: CalendarDays,
  house: House,
  attic: Layers,
  "air-seal": Wind,
  hvac: Fan,
  ducts: Spline,
  windows: AppWindow,
  media: Image,
  assess: ClipboardList,
  options: LayoutList,
  pay: CreditCard,
  proposal: FileText,
  report: ClipboardCheck,
  agreement: FileSignature,
  stage: ListOrdered,
  job: Briefcase,
  pipeline: GitMerge,
  jobs: Briefcase,
  account: Building2,
  visits: CalendarDays,
  photos: Image,
  next: CircleDollarSign,
  follow: CircleDollarSign,
  service: Wrench,
  reviews: Star,
  records: FileText,
  opp: Star,
  sold: BadgeCheck,
  survey: Ruler,
  ready: ClipboardCheck,
  crew: HardHat,
  run: Wrench,
  money: CircleDollarSign,
  close: Flag,
};

const FilePaneFoot = createContext<ReactNode>(null);
let openSection: ((id: string) => void) | null = null;
let paneEl: HTMLDivElement | null = null;

export function FilePane({ foot, children }: { foot?: ReactNode; children: ReactNode }) {
  return (
    <FilePaneFoot.Provider value={foot}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:contents">{children}</div>
    </FilePaneFoot.Provider>
  );
}

export function scrollFileSection(id: string) {
  openSection?.(id);
}

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
  const foot = useContext(FilePaneFoot);
  const paneRef = useRef<HTMLDivElement>(null);
  const sourced = sections.filter((s) => s.node != null && s.id !== "book");
  const book = sections.find((s) => s.id === "book" && s.node != null);
  const ready = Boolean(advance) && sourced.every((s) => s.done);
  const items = layout === "swap" && foot ? [...sourced, ...(book ? [book] : []), { id: "media", label: "Media", node: foot, icon: Image }] : [...sourced, ...(book ? [book] : [])];
  const [active, setActive] = useState(start && items.some((s) => s.id === start) ? start : items[0]?.id ?? "");
  const [slim, setSlim] = useState(() => {
    try {
      return localStorage.getItem("cozy.fileRail") === "slim";
    } catch {
      return false;
    }
  });
  const current = items.find((s) => s.id === active) ?? items[0];
  const idx = Math.max(0, items.findIndex((s) => s.id === current?.id));
  const next = items[idx + 1];
  const prev = items[idx - 1];
  const lastWork = sourced[sourced.length - 1];
  const onLast = Boolean(advance) && current?.id === lastWork?.id;

  useEffect(() => {
    openSection = (id: string) => {
      if (items.some((s) => s.id === id)) setActive(id);
    };
    paneEl = paneRef.current;
    return () => {
      openSection = null;
    };
  });

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
            paneEl = n;
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:col-start-2 lg:row-start-1">
        <nav className="flex shrink-0 items-center gap-1 overflow-hidden border-b border-line bg-card px-1.5 py-1.5 md:hidden">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {items.map((s) => {
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
            paneEl = n;
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