import { useLayoutEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { GROUPS, activePath } from "@/components/app-shell/nav-data";

const SHORT: Record<string, string> = {
  "/": "Live",
  "/assessments": "Assess",
  "/opportunities": "Opps",
  "/memberships": "Members",
};

const PIPE = new Set(["/leads", "/assessments", "/opportunities", "/projects", "/memberships", "/accounts"]);

export function MobileBar({ pathname }: { pathname: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const items = GROUPS.flatMap((g) => g.items);
  const tab = "flex h-14 shrink-0 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold whitespace-nowrap";

  useLayoutEffect(() => {
    const bar = scroller.current;
    if (!bar) return;
    const place = () => {
      const lead = bar.querySelector<HTMLElement>('[data-tab="/leads"]');
      const on = bar.querySelector<HTMLElement>('[aria-current="page"]');
      if (!lead || bar.clientWidth === 0 || lead.offsetLeft === 0) return false;
      const end = lead.offsetLeft + bar.clientWidth;
      const outside = on && (on.offsetLeft < lead.offsetLeft || on.offsetLeft >= end - 1);
      bar.scrollLeft = outside && on ? Math.max(0, on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2) : lead.offsetLeft;
      return true;
    };
    if (place()) return;
    const watch = new ResizeObserver(() => {
      if (place()) watch.disconnect();
    });
    watch.observe(bar);
    return () => watch.disconnect();
  }, [pathname]);

  return (
    <nav className="@container fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Primary">
      <div ref={scroller} className="flex h-14 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const on = activePath(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              data-tab={item.to}
              aria-current={on ? "page" : undefined}
              className={cn(tab, PIPE.has(item.to) ? "w-[calc(100cqw/6)]" : "min-w-[calc(100cqw/6)] px-3", on ? "text-navy" : "text-muted")}
            >
              <Icon className="size-4 shrink-0" />
              {SHORT[item.to] ?? item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
