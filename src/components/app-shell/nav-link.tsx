import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { activePath } from "@/components/app-shell/nav-data";

export function RailLink({
  to,
  label,
  icon: Icon,
  badge,
  live,
  shut,
  salesBoard,
  pathname,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  live?: boolean;
  shut: boolean;
  salesBoard: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  const on = activePath(pathname, to);
  return (
    <Tip label={label} on={shut} side="right" className={shut ? undefined : "w-full"}>
      <Link
        to={to}
        preload="intent"
        aria-current={on ? "page" : undefined}
        search={to === "/" && salesBoard ? { board: "sales" } : undefined}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center rounded-md text-[13px] font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
          shut ? "size-10 justify-center" : "h-10 gap-3 px-3",
          on ? "bg-white/15 text-card" : shut ? "text-card/70 hover:bg-white/10 hover:text-card" : "text-faint hover:bg-white/10 hover:text-card",
        )}
      >
        <Icon className={cn("shrink-0", shut ? "size-5" : "size-4")} />
        {shut && live ? <span className="live-pip absolute top-1.5 right-1.5" /> : null}
        {!shut ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
        {!shut && live ? <span className="live-pip" /> : null}
        {badge ? (
          shut ? (
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-stop" />
          ) : (
            <span className="grid h-5 min-w-5 place-items-center rounded-sm bg-stop px-1 text-[11px] font-bold text-card">{badge}</span>
          )
        ) : null}
      </Link>
    </Tip>
  );
}
