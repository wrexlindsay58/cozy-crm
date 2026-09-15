import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  FolderKanban,
  FileText,
  HardHat,
  House,
  Map,
  MessageSquare,
  PanelLeft,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Sun,
  Ticket,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { CozyHouse, CozyWordmark } from "@/components/cozy-mark";
import { unreadConversations } from "@/lib/crm-data";
import { incidents, notCalled } from "@/lib/snapshot";

const DAILY = [
  { icon: Sun, label: "Today", to: "/" },
  { icon: MessageSquare, label: "Inbox", to: "/conversations", badge: unreadConversations },
  { icon: Calendar, label: "Book", to: "/calendar" },
  { icon: Map, label: "Map", to: "/dispatch" },
] as const;

const PIPELINE = [
  { icon: Users, label: "Leads", to: "/leads" },
  { icon: ClipboardList, label: "Appointments", to: "/appointments" },
  { icon: House, label: "Assessments", to: "/assessments" },
  { icon: Star, label: "Opportunities", to: "/opportunities" },
  { icon: Briefcase, label: "Jobs", to: "/projects" },
  { icon: FolderKanban, label: "Accounts", to: "/accounts" },
] as const;

const MONEY = [
  { icon: BarChart3, label: "Sales", to: "/scoreboard" },
  { icon: Receipt, label: "Invoices", to: "/invoices" },
  { icon: ShoppingCart, label: "Purchasing", to: "/purchasing" },
] as const;

const COMPANY = [
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
  { icon: HardHat, label: "Crews", to: "/crews" },
  { icon: UserRound, label: "Team", to: "/team" },
  { icon: Ticket, label: "Tickets", to: "/tickets" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("cozy-nav");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggle() {
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
  }: {
    to: string;
    label: string;
    icon: LucideIcon;
    badge?: number;
  }) {
    const on = activePath(pathname, to);
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex h-10 items-center gap-3 rounded-sm px-3 text-[13px] font-medium",
          on ? "bg-white/15 text-card" : "text-faint hover:bg-white/10 hover:text-card",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed ? <span className="flex-1">{label}</span> : null}
        {!collapsed && badge ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-stop px-1 text-[11px] font-bold text-card">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="grid h-dvh w-full min-w-0 max-w-full grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-page text-ink">
      <header className="z-30 flex min-w-0 items-center gap-3 border-b border-white/10 bg-navy px-3 text-card md:px-4">
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
        <Link to="/" className="shrink-0">
          <CozyWordmark className="h-6 w-28 md:h-7 md:w-32" />
        </Link>
        <form
          className="relative ml-2 hidden min-w-0 flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            const q = String(new FormData(e.currentTarget).get("q") ?? "");
            void navigate({ to: "/leads", search: { q } });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
          <input
            name="q"
            className="h-10 w-full rounded-md border-0 bg-card pr-3 pl-9 text-[13px] text-ink outline-none placeholder:text-faint"
            placeholder="Name, phone, address"
          />
        </form>
        <div className="ml-auto flex items-center gap-1">
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
          <Link to="/settings" className="ml-1 flex h-10 items-center gap-2 text-[13px] font-semibold">
            <span className="size-7 overflow-hidden rounded-sm bg-page">
              <CozyHouse className="size-7" />
            </span>
            <span className="hidden sm:inline">Wrex</span>
          </Link>
        </div>
      </header>

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
            "z-30 flex min-h-0 shrink-0 flex-col overflow-y-auto bg-navy py-3",
            "max-md:absolute max-md:inset-y-0 max-md:left-0",
            mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
            collapsed ? "w-16" : "w-56",
          )}
        >
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-3 px-2">
              <p className={cn("px-3 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase", collapsed && "sr-only")}>
                {group.label}
              </p>
              <nav className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.to} {...item} />
                ))}
              </nav>
            </div>
          ))}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
