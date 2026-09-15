import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ACT_ICONS } from "@/lib/chrome";
import { Scrim } from "@/components/scrim";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";

export type ActItem = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  menu?: { label: string; onClick?: () => void }[];
  variant?: "navy" | "line";
};

export function ActBar({ items }: { items: ActItem[] }) {
  const { barRef, measureRef, iconsOnly } = useFit();
  return (
    <div className="relative min-w-0">
      <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1.5 whitespace-nowrap" aria-hidden>
        {items.map((item) => (
          <span key={item.label} className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-semibold">
            {item.label}
          </span>
        ))}
      </div>
      <div ref={barRef} className="flex flex-wrap justify-end gap-1.5">
        {items.map((item) => (
          <ActBtn key={item.label} item={item} iconsOnly={iconsOnly} />
        ))}
      </div>
    </div>
  );
}

export function ActBtn({
  item,
  iconsOnly,
}: {
  item: ActItem;
  iconsOnly: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon ?? ACT_ICONS[item.label];
  const cls = cn(
    "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-semibold",
    item.variant === "navy" ? "bg-navy text-card" : "border border-line bg-card hover:border-navy",
    iconsOnly && "w-11 px-0",
  );
  const inner = (
    <>
      {Icon ? <Icon className="size-4" /> : null}
      {iconsOnly ? <span className="sr-only">{item.label}</span> : item.label}
    </>
  );
  let control: ReactNode;
  if (item.menu) {
    control = (
      <div className="relative">
        <button type="button" aria-label={item.label} className={cls} onClick={() => setOpen((v) => !v)}>
          {inner}
        </button>
        {open ? (
          <>
            <Scrim onClose={() => setOpen(false)} />
            <div className="absolute top-11 right-0 z-30 min-w-40 rounded-md border border-line bg-card py-1 shadow-sm">
              {item.menu.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-page"
                  onClick={() => {
                    m.onClick?.();
                    setOpen(false);
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  } else {
    control = (
      <button type="button" aria-label={item.label} className={cls} onClick={item.onClick}>
        {inner}
      </button>
    );
  }
  return (
    <Tip label={item.label} on={iconsOnly} side="bottom">
      {control}
    </Tip>
  );
}
