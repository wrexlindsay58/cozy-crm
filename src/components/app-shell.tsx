import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  PanelLeft,
  Search,
  Settings,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { CozyHouse, CozyWordmark } from "@/components/cozy-mark";
import { tickets } from "@/lib/crm-data";

const SALES = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Users, label: "Leads", to: "/leads" },
  { icon: Star, label: "Opportunities", to: "/opportunities" },
  { icon: Briefcase, label: "Projects", to: "/projects" },
  { icon: FolderKanban, label: "Accounts", to: "/accounts" },
] as const;

const OPS = [
  { icon: Calendar, label: "Calendar", to: "/calendar" },
  { icon: ClipboardList, label: "Tickets", to: "/tickets", badge: tickets.filter((t) => t.status !== "Done").length },
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
] as const;

function activePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const openTickets = tickets.filter((t) => t.status !== "Done").length;

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
    icon: typeof LayoutDashboard;
    badge?: number;
  }) {
    const on = activePath(pathname, to);
    return (
      <Link
        to={to}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium",
          on ? "bg-white/15 text-card" : "text-faint hover:bg-white/10 hover:text-card",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed ? <span className="flex-1">{label}</span> : null}
        {!collapsed && badge ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-alert px-1 text-[10px] font-bold text-card">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="grid min-h-dvh grid-rows-[52px_1fr] bg-page text-ink">
      <header className="z-30 flex items-center gap-3 border-b border-white/10 bg-navy px-3 text-card md:px-4">
        <button
          type="button"
          onClick={() => {
            if (window.matchMedia("(max-width: 767px)").matches) {
              setMobileOpen((o) => !o);
            } else {
              toggle();
            }
          }}
          className="grid size-10 place-items-center rounded-lg text-faint hover:bg-white/10 hover:text-card"
          aria-label="Toggle menu"
        >
          <PanelLeft className="size-4" />
        </button>
        <Link to="/" className="shrink-0">
          <CozyWordmark className="h-6 w-28 md:h-7 md:w-32" />
        </Link>
        <form
          className="relative ml-2 hidden max-w-md flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            const q = String(new FormData(e.currentTarget).get("q") ?? "");
            void navigate({ to: "/leads", search: { q } });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
          <input
            name="q"
            className="h-9 w-full rounded-lg border-0 bg-card pr-3 pl-9 text-sm text-ink outline-none placeholder:text-faint"
            placeholder="Search leads, jobs, members"
          />
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/tickets"
            className="relative grid size-10 place-items-center text-faint hover:text-card"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-alert px-0.5 text-[9px] font-bold text-card">
              {openTickets}
            </span>
          </Link>
          <Link to="/settings" className="ml-1 flex items-center gap-2 text-sm font-semibold">
            <span className="size-7 overflow-hidden rounded-full bg-page ring-1 ring-white/20">
              <CozyHouse className="size-7" />
            </span>
            <span className="hidden sm:inline">Wrex</span>
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0">
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
            "z-30 flex shrink-0 flex-col bg-navy py-3 transition-[width,transform] duration-200",
            "max-md:absolute max-md:inset-y-0 max-md:left-0",
            mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
            collapsed ? "w-16" : "w-56",
          )}
        >
          <p className={cn("px-4 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase", collapsed && "sr-only")}>
            Sales
          </p>
          <nav className="flex flex-col gap-0.5 px-2">
            {SALES.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>
          <p className={cn("mt-4 px-4 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase", collapsed && "sr-only")}>
            Ops
          </p>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {OPS.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
            <div className="flex-1" />
            <NavLink to="/reports" label="Reports" icon={BarChart3} />
            <NavLink to="/settings" label="Settings" icon={Settings} />
          </nav>
        </aside>

        <div className="min-w-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
