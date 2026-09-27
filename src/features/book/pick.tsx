import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function BookPick<T extends string>({
  value,
  items,
  onChange,
  plain,
  className,
}: {
  value: T;
  items: { id: T; label: string; short?: string; hint?: string }[];
  onChange: (v: T) => void;
  plain?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = items.find((i) => i.id === value) ?? items[0];
  const hot = value !== items[0].id;
  return (
    <>
      <button
        type="button"
        aria-label={current.label}
        aria-expanded={open}
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex h-9 min-w-0 max-w-[11rem] items-center gap-1 rounded-md border px-2.5 text-[13px] font-semibold max-md:h-8 max-md:px-2 max-md:text-[12px]",
          !plain && hot ? "border-navy bg-navy text-card" : "border-line",
          className,
        )}
      >
        <Tip label={current.hint ?? ""} on={Boolean(current.hint)} className="min-w-0">
          <span className="truncate">
            <span className="md:hidden">{current.short ?? current.label}</span>
            <span className="hidden md:inline">{current.label}</span>
          </span>
        </Tip>
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn("flex min-h-10 w-full min-w-40 items-center px-3 py-1.5 text-left text-sm", item.id === value ? "font-semibold" : "hover:bg-page")}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              <span className="min-w-0">
                <span className="block">{item.label}</span>
                {item.hint ? <span className="block text-[11px] font-normal text-muted">{item.hint}</span> : null}
              </span>
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}
