import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { GROUPS, activePath, itemBadge } from "@/components/app-shell/nav-data";

export function MobileNavSheet({
  pathname,
  salesBoard,
  pastDueN,
  paperN,
  onClose,
}: {
  pathname: string;
  salesBoard: boolean;
  pastDueN: number;
  paperN: number;
  onClose: () => void;
}) {
  const startY = useRef(0);
  const [dy, setDy] = useState(0);
  function down(e: ReactPointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: ReactPointerEvent<HTMLDivElement>) {
    setDy(Math.max(0, e.clientY - startY.current));
  }
  function up() {
    if (dy > 72) onClose();
    setDy(0);
  }
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-md bg-navy text-card shadow-sm" style={{ transform: `translateY(${dy}px)` }}>
        <div className="flex h-11 shrink-0 cursor-grab touch-none items-center justify-center" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
          <span className="h-1 w-10 rounded-full bg-white/30" />
        </div>
        <div className="min-h-0 overflow-auto px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-1 pb-1 text-[10px] font-bold tracking-[0.14em] text-faint uppercase">{group.label}</p>
              {group.items.map((item) => {
                const on = activePath(pathname, item.to);
                const Icon = item.icon;
                const label = item.to === "/" ? (salesBoard ? "Sales Board" : "Live Board") : item.label;
                const badge = itemBadge(item, pastDueN, paperN);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    preload="intent"
                    aria-current={on ? "page" : undefined}
                    onClick={onClose}
                    className={cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium", on ? "bg-white/15 text-card" : "text-faint")}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {badge ? <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-stop px-1 text-[11px] font-bold text-card">{badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
