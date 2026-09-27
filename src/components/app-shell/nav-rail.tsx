import { cn } from "@/lib/cn";
import { GROUPS, itemBadge } from "@/components/app-shell/nav-data";
import { RailLink } from "@/components/app-shell/nav-link";

export function NavRail({
  shut,
  pathname,
  salesBoard,
  pastDueN,
  paperN,
  onNavigate,
}: {
  shut: boolean;
  pathname: string;
  salesBoard: boolean;
  pastDueN: number;
  paperN: number;
  onNavigate: () => void;
}) {
  return (
    <aside
      className={cn(
        "z-30 flex min-h-0 shrink-0 flex-col overflow-y-auto bg-navy max-lg:hidden",
        shut ? "w-14 items-center py-2" : "w-56 py-3",
      )}
    >
      {GROUPS.map((group, i) => (
        <div key={group.label} className={cn(shut ? "flex flex-col items-center" : "mb-3 px-2")}>
          {shut && i > 0 ? <div className="my-1.5 h-px w-6 bg-white/15" aria-hidden /> : null}
          {shut ? null : <p className="px-3 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">{group.label}</p>}
          <nav className={cn("flex flex-col", shut ? "items-center gap-0.5" : "gap-0.5")}>
            {group.items.map((item) => (
              <RailLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                shut={shut}
                salesBoard={salesBoard}
                pathname={pathname}
                onNavigate={onNavigate}
                label={item.to === "/" ? (salesBoard ? "Sales Board" : "Live Board") : item.label}
                live={item.live && !salesBoard ? true : undefined}
                badge={itemBadge(item, pastDueN, paperN) || undefined}
              />
            ))}
          </nav>
        </div>
      ))}
    </aside>
  );
}
