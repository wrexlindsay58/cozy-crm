import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AppWindow, BadgeCheck, Briefcase, Building2, CalendarDays, ClipboardList, CreditCard, Fan, FileText, FileSignature, GitMerge, HardHat, House, Image, Layers, LayoutList, ListOrdered, Spline, Star, UserRound, Wind, Wrench, CircleDollarSign, Flag, Ruler, ClipboardCheck, type LucideIcon } from "lucide-react";

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

export const ICONS: Record<string, LucideIcon> = {
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
  plan: BadgeCheck,
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

export let paneEl: HTMLDivElement | null = null;

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

export function useFileSections(sections: any, layout: any, banner: any, start: any, advance: any) {
  const foot = useContext(FilePaneFoot);
  const paneRef = useRef<HTMLDivElement>(null);
  const sourced = sections.filter((s: any) => s.node != null && s.id !== "book");
  const book = sections.find((s: any) => s.id === "book" && s.node != null);
  const ready = Boolean(advance) && sourced.every((s: any) => s.done);
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
  return { items, setActive, paneRef, foot, slim, next, setSlim, current, prev, onLast, ready };
}

export function write_paneEl(__v: any) { paneEl = __v; }
