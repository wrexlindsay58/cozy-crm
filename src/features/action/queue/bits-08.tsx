import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function MenuPick<T extends string>({
  label,
  value,
  options,
  onChange,
  compact,
  icon: Icon,
  iconsOnly,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  compact?: boolean;
  icon?: typeof Layers;
  iconsOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = options.find((o) => o.id === value)?.label ?? options[0]?.label ?? label;
  const hot = value !== options[0]?.id;
  return (
    <>
      <Tip label={`${label} · ${current}`} on={Boolean(iconsOnly)} className={iconsOnly ? "min-w-0 flex-1" : undefined}>
        <button
          type="button"
          aria-label={`${label}: ${current}`}
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex min-w-0 items-center rounded-md font-semibold",
            iconsOnly
              ? "h-11 w-full justify-center"
              : compact
                ? "h-9 shrink-0 gap-1.5 px-2.5 text-[12px]"
                : "h-11 min-w-0 gap-1.5 px-3 text-[13px]",
            hot ? "bg-navy text-card" : "border border-line bg-card text-muted hover:text-ink",
          )}
        >
          {iconsOnly && Icon ? (
            <Icon className="size-4" />
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={hot ? "text-card/80" : "text-muted"}>{label}</span>
                <span className="truncate">{current}</span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 opacity-70" />
            </>
          )}
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="flex h-10 w-full min-w-44 items-center justify-between gap-2 px-3 text-left text-sm hover:bg-page"
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              <span className="flex items-center gap-2">
                {o.count != null ? <span className="text-[11px] text-muted">{o.count}</span> : null}
                {o.id === value ? <span className="text-[11px] font-bold text-navy">On</span> : null}
              </span>
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}
