import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { ACT_ICONS } from "@/lib/chrome";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";

export type ActItem = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  menu?: { label: string; onClick?: () => void }[];
  variant?: "navy" | "line";
};

export function ActBar({ items, iconsOnly: forceIcons }: { items: ActItem[]; iconsOnly?: boolean }) {
  const { barRef, measureRef, iconsOnly: fitIcons } = useFit();
  const iconsOnly = forceIcons ?? fitIcons;
  return (
    <div className="relative min-w-0">
      {forceIcons ? null : (
        <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1.5 whitespace-nowrap" aria-hidden>
          {items.map((item) => (
            <span key={item.label} className="inline-flex h-11 items-center gap-1.5 px-3 text-sm font-semibold">
              {item.label}
            </span>
          ))}
        </div>
      )}
      <div ref={barRef} className="flex flex-wrap justify-end gap-1.5">
        {items.map((item) => (
          <ActBtn key={item.label} item={item} iconsOnly={iconsOnly} />
        ))}
      </div>
    </div>
  );
}

function MenuItems({
  menu,
  onPick,
}: {
  menu: { label: string; onClick?: () => void }[];
  onPick: () => void;
}) {
  return (
    <>
      {menu.map((m) => (
        <button
          key={m.label}
          type="button"
          className="block w-full min-w-44 px-3 py-2 text-left text-sm hover:bg-page"
          onClick={() => {
            m.onClick?.();
            onPick();
          }}
        >
          {m.label}
        </button>
      ))}
    </>
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
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
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

  function openAt(el: HTMLElement) {
    setAnchor(el.getBoundingClientRect());
    setOpen((v) => !v);
  }

  let control: ReactNode;
  if (item.menu && item.onClick) {
    const navy = item.variant === "navy";
    control = (
      <div
        className={cn(
          "inline-flex h-11 overflow-hidden rounded-md",
          navy ? "bg-navy text-card" : "border border-line bg-card",
        )}
      >
        <button type="button" aria-label={item.label} className="grid w-11 place-items-center" onClick={item.onClick}>
          {inner}
        </button>
        <span className={cn("w-px self-stretch", navy ? "bg-card/20" : "bg-line")} />
        <button
          type="button"
          aria-label={`${item.label} from`}
          className="grid w-8 place-items-center"
          onClick={(e) => openAt(e.currentTarget)}
        >
          <ChevronDown className="size-3.5 opacity-80" />
        </button>
        {open && anchor ? (
          <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
            <MenuItems menu={item.menu} onPick={() => setOpen(false)} />
          </Float>
        ) : null}
      </div>
    );
  } else if (item.menu) {
    control = (
      <div className="relative">
        <button type="button" aria-label={item.label} className={cls} onClick={(e) => openAt(e.currentTarget)}>
          {inner}
        </button>
        {open && anchor ? (
          <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
            <MenuItems menu={item.menu} onPick={() => setOpen(false)} />
          </Float>
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
