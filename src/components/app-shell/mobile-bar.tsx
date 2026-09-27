import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { BOTTOM_NAV, activePath } from "@/components/app-shell/nav-data";

export function MobileBar({ pathname, onSearch }: { pathname: string; onSearch: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Primary">
      <div className="grid h-14 grid-cols-5">
        {BOTTOM_NAV.map((item) => {
          const on = activePath(pathname, item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              aria-current={on ? "page" : undefined}
              className={cn("flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] font-semibold", on ? "text-navy" : "text-muted")}
            >
              <Icon className="size-4 shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button type="button" className="flex min-h-11 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold text-muted" onClick={onSearch}>
          <Search className="size-4" />
          Search
        </button>
      </div>
    </nav>
  );
}
