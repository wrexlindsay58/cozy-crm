import type { LucideIcon } from "lucide-react";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";
import { cn } from "@/lib/cn";
import { LANES, type ConvLane } from "./lanes";

export type ConvTab = { id: string; label: string; icon: LucideIcon };

function TabBtn({
  tab,
  lane,
  onLane,
  icons,
  className,
}: {
  tab: ConvTab;
  lane: string;
  onLane: (id: ConvLane | string) => void;
  icons: boolean;
  className?: string;
}) {
  const Icon = tab.icon;
  const on = lane === tab.id;
  const btn = (
    <button
      type="button"
      aria-label={tab.label}
      onClick={() => onLane(tab.id)}
      className={cn(
        "flex h-10 items-center justify-center gap-1.5 rounded-md text-xs font-semibold",
        icons ? "w-full px-0" : "shrink-0 px-2.5",
        on ? "bg-navy text-card" : "text-muted hover:text-ink",
        className,
      )}
    >
      <Icon className="size-4" />
      {icons ? <span className="sr-only">{tab.label}</span> : tab.label}
    </button>
  );
  return icons ? (
    <Tip label={tab.label} on side="bottom" className={cn("min-w-0 max-w-10 flex-1", className)}>
      {btn}
    </Tip>
  ) : (
    btn
  );
}

export function ConvTabs({
  lane,
  onLane,
  withBook = true,
  extra = [],
  extraClassName,
  iconsOnly: forceIcons,
}: {
  lane: string;
  onLane: (id: ConvLane | string) => void;
  withBook?: boolean;
  extra?: ConvTab[];
  extraClassName?: (id: string) => string | undefined;
  iconsOnly?: boolean;
}) {
  const lanes = withBook ? LANES : LANES.filter((l) => l.id !== "book");
  const rest = lanes.filter((l) => l.id !== "form");
  const form = lanes.filter((l) => l.id === "form");
  const items = [...rest, ...extra, ...form];
  const { barRef, measureRef, iconsOnly: fitIcons } = useFit();
  const icons = forceIcons ?? fitIcons;

  return (
    <div className="relative border-b border-line">
      {forceIcons ? null : (
        <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1 px-2 py-2 whitespace-nowrap" aria-hidden>
          {items.map((l) => {
            const Icon = l.icon;
            return (
              <span key={l.id} className="flex h-10 items-center gap-1.5 px-2.5 text-xs font-semibold">
                <Icon className="size-4" />
                {l.label}
              </span>
            );
          })}
        </div>
      )}
      <div ref={barRef} className="flex w-full min-w-0 items-center gap-0.5 overflow-hidden px-1.5 py-1.5 md:gap-1 md:px-2 md:py-2">
        {items.map((tab) => (
          <TabBtn
            key={tab.id}
            tab={tab}
            lane={lane}
            onLane={onLane}
            icons={icons}
            className={extraClassName?.(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}
