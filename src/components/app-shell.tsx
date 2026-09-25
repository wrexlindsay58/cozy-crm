import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  FolderKanban,
  FileText,
  HardHat,
  House,
  ListChecks,
  Map,
  MessageSquare,
  PanelLeft,
  Radio,
  Search,
  Settings,
  ScrollText,
  Star,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { CozyHouse, CozyWordmark } from "@/components/cozy-mark";
import { Omnibox } from "@/features/search/omnibox";
import { unreadConversations } from "@/lib/crm-data";
import { liveStatus, NAV_COLLAPSE_PX } from "@/lib/chrome";
import { incidents, notCalled } from "@/lib/snapshot";
import { useOps } from "@/features/ops/store";
import { useJobs } from "@/features/job/store";
import { useProposals } from "@/features/opportunity/store";
import { paperAlertCount } from "@/features/paper/model";

const DAILY = [
  { icon: Radio, label: "Live Board", to: "/", live: true },
  { icon: MessageSquare, label: "Inbox", to: "/conversations", badge: unreadConversations },
  { icon: Calendar, label: "Book", to: "/calendar" },
  { icon: Map, label: "Map", to: "/dispatch" },
  { icon: ListChecks, label: "Actions", to: "/tickets" },
] as const;

const PIPELINE = [
  { icon: Users, label: "Leads", to: "/leads" },
  { icon: House, label: "Assessments", to: "/assessments" },
  { icon: Star, label: "Opportunities", to: "/opportunities" },
  { icon: Briefcase, label: "Jobs", to: "/projects" },
  { icon: FolderKanban, label: "Accounts", to: "/accounts" },
] as const;

const MONEY = [
  { icon: ScrollText, label: "Paper", to: "/paper" },
] as const;

const COMPANY = [
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
  { icon: HardHat, label: "Crews", to: "/crews" },
  { icon: UserRound, label: "Team", to: "/team" },
  { icon: FileText, label: "Reports", to: "/reports" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

const GROUPS = [
  { label: "Daily", items: DAILY },
  { label: "Pipeline", items: PIPELINE },
  { label: "Money", items: MONEY },
  { label: "Company", items: COMPANY },
] as const;

function activePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

const lateCount = incidents.length + notCalled.length;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [forceOpen, setForceOpen] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const salesBoard = useRouterState({ select: (s) => (s.location.search as { board?: string }).board === "sales" });
  const { actions, leads } = useOps();
  const jobs = useJobs();
  const proposals = useProposals();
  const pastDueN = actions.filter((a) => liveStatus(a.status, a.due) === "Past Due").length;
  const paperN = useMemo(() => paperAlertCount(Object.values(jobs), Object.values(proposals), leads), [jobs, proposals, leads]);
  const shut = autoCollapse ? !forceOpen : collapsed;

  useEffect(() => {
    const saved = localStorage.getItem("cozy-nav");
    if (saved === "1") setCollapsed(true);
    const mq = window.matchMedia(`(max-width: ${NAV_COLLAPSE_PX}px)`);
    function apply() {
      setAutoCollapse(mq.matches);
      if (!mq.matches) setForceOpen(false);
    }
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  function toggle() {
    if (autoCollapse) {
      setForceOpen((v) => !v);
      return;
    }
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("cozy-nav", next ? "1" : "0");
      return next;
    });
  }

  function NavLink({
    to,
    label,
    icon: Icon,
    badge,
    live,
  }: {
    to: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
    live?: boolean;
  }) {
    const on = activePath(pathname, to);
    return (
      <Tip label={label} on={shut} side="right" className={shut ? undefined : "w-full"}>
        <Link
          to={to}
          search={to === "/" && salesBoard ? { board: "sales" } : undefined}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "relative flex items-center rounded-md text-[13px] font-medium",
            shut
              ? "size-10 justify-center"
              : "h-10 gap-3 px-3",
            on ? "bg-white/15 text-card" : shut ? "text-card/70 hover:bg-white/10 hover:text-card" : "text-faint hover:bg-white/10 hover:text-card",
          )}
        >
          <Icon className={cn("shrink-0", shut ? "size-5" : "size-4")} />
          {shut && live ? <span className="live-pip absolute top-1.5 right-1.5" /> : null}
          {!shut ? <span className="flex-1">{label}</span> : null}
          {!shut && live ? <span className="live-pip" /> : null}
          {badge ? (
            shut ? (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-stop" />
            ) : (
              <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-stop px-1 text-[11px] font-bold text-card">
                {badge}
              </span>
            )
          ) : null}
        </Link>
      </Tip>
    );
  }

  return (
    <div className="relative grid h-dvh w-full min-w-0 max-w-full grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-page text-ink">
      <header className="z-30 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 bg-navy pl-3 text-card md:pl-4">
        <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (window.matchMedia("(max-width: 767px)").matches) {
              setMobileOpen((o) => !o);
            } else {
              toggle();
            }
          }}
          className="grid size-10 place-items-center rounded-md text-faint hover:bg-white/10 hover:text-card"
          aria-label="Toggle menu"
        >
          <PanelLeft className="size-4" />
        </button>
        <Link
          to="/"
          className="flex h-10 items-center rounded-md bg-card px-2.5 shadow-[0_1px_2px_rgba(12,35,64,0.18)] ring-1 ring-black/5"
        >
          <CozyWordmark className="h-[26px] w-[78px] md:h-[30px] md:w-[90px]" house="#C2162E" word="#0C2340" />
        </Link>
        </div>
        <div className="relative hidden w-full justify-center md:flex">
          <div className="w-[70%] max-w-md min-w-48">
            <Omnibox />
          </div>
        </div>
        <div className="flex h-full items-center justify-end">
          <button
            type="button"
            className="grid size-10 place-items-center text-faint hover:text-card md:hidden"
            aria-label="Search"
            onClick={() => setMobileSearch((v) => !v)}
          >
            <Search className="size-4" />
          </button>
          <Link
            to="/"
            hash="late"
            className="relative grid size-10 place-items-center text-faint hover:text-card"
            aria-label="Late"
          >
            <Bell className="size-4" />
            {lateCount ? (
              <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-sm bg-stop px-0.5 text-[11px] font-bold text-card">
                {lateCount}
              </span>
            ) : null}
          </Link>
          <Link to="/settings" className="flex h-full items-center gap-2 pr-3 pl-2 text-[13px] font-semibold">
            <span className="size-7 overflow-hidden rounded-sm bg-page">
              <CozyHouse className="size-7" />
            </span>
            <span className="hidden sm:inline">Wrex</span>
          </Link>
        </div>
      </header>
      {mobileSearch ? (
        <div className="absolute top-14 right-0 left-0 z-40 border-b border-white/10 bg-navy px-3 py-2 md:hidden">
          <Omnibox compact />
        </div>
      ) : null}

      <div className="relative flex min-h-0 min-w-0 overflow-hidden">
        {mobileOpen ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-ink/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "z-30 flex min-h-0 shrink-0 flex-col overflow-y-auto bg-navy",
            "max-md:absolute max-md:inset-y-0 max-md:left-0",
            mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
            shut ? "w-14 items-center py-2" : "w-56 py-3",
          )}
        >
          {GROUPS.map((group, i) => (
            <div key={group.label} className={cn(shut ? "flex flex-col items-center" : "mb-3 px-2")}>
              {shut && i > 0 ? <div className="my-1.5 h-px w-6 bg-white/15" aria-hidden /> : null}
              {shut ? null : (
                <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">{group.label}</p>
              )}
              <nav className={cn("flex flex-col", shut ? "items-center gap-0.5" : "gap-0.5")}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    {...item}
                    label={item.to === "/" ? (salesBoard ? "Sales Board" : "Live Board") : item.label}
                    live={"live" in item && item.live && !salesBoard ? true : undefined}
                    badge={item.to === "/tickets" ? pastDueN || undefined : item.to === "/paper" ? paperN || undefined : "badge" in item ? item.badge : undefined}
                  />
                ))}
              </nav>
            </div>
          ))}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-none">{children}</div>
      </div>
    </div>
  );
}
