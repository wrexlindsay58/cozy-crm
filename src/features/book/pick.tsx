import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Float } from "@/components/float";
import { cn } from "@/lib/cn";

export function BookPick<T extends string>({
  value,
  items,
  onChange,
}: {
  value: T;
  items: { id: T; label: string }[];
  onChange: (v: T) => void;
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
          "inline-flex h-9 max-w-[11rem] items-center gap-1 rounded-md border px-2.5 text-[13px] font-semibold",
          hot ? "border-navy bg-navy text-card" : "border-line",
        )}
      >
        <span className="truncate">{current.label}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn("flex h-10 w-full min-w-40 items-center px-3 text-left text-sm", item.id === value ? "font-semibold" : "hover:bg-page")}
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}
