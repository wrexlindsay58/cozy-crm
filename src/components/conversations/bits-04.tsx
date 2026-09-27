import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";

export function Pick<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly { id: T; label: string; face?: string; icon: typeof Star }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = items.find((i) => i.id === value) ?? items[0];
  const Icon = current.icon;
  const hot = value !== items[0].id;
  return (
    <>
      <Tip label={current.label} on side="bottom" className="min-w-0 flex-1">
        <button
          type="button"
          aria-label={current.label}
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1",
            hot ? "bg-navy text-card" : "text-muted hover:bg-page",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">{current.face ?? current.label}</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" />
        </button>
      </Tip>
      {open && anchor ? (
        <Float
          anchor={anchor}
          prefer="bottom"
          onClose={() => setOpen(false)}
        >
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="flex h-10 w-full min-w-44 items-center gap-2 px-3 text-left text-sm hover:bg-page"
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <ItemIcon className="size-3.5" />
                <span className="flex-1">{item.label}</span>
                {item.id === value ? <span className="text-[11px] font-bold text-navy">On</span> : null}
              </button>
            );
          })}
        </Float>
      ) : null}
    </>
  );
}

export type Extra = { dnd: boolean; booked: boolean; actions: boolean; status: string };
