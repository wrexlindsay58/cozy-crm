import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { BOTTOM_NAV, activePath } from "@/components/app-shell/nav-data";

export function MobileBar({ pathname }: { pathname: string }) {
  const tab =
    "flex h-14 min-w-fit flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold whitespace-nowrap";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Primary">
      <div className="flex h-14">
        {BOTTOM_NAV.map((item) => {
          const on = activePath(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              aria-current={on ? "page" : undefined}
              className={cn(tab, on ? "text-navy" : "text-muted")}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}