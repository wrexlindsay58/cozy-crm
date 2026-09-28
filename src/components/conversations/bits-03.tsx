import { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import { setCallFrom, setSmsFrom, useFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";

export function PhoneSplit({ onCall, disabled, className }: { onCall: () => void; disabled?: boolean; className?: string }) {
  const { numbers } = useMoneySettings();
  const { callFrom } = useFrom();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className={cn("inline-flex h-9 overflow-hidden rounded-md border border-line bg-card", disabled && "opacity-40", className)}>
      <Tip label="Call" on>
        <button type="button" aria-label="Call" disabled={disabled} className="grid w-9 place-items-center disabled:cursor-not-allowed" onClick={onCall}>
          <Phone className="size-4" />
        </button>
      </Tip>
      <span className="w-px self-stretch bg-line" />
      <button
        type="button"
        aria-label="Call from"
        disabled={disabled}
        className="grid w-7 place-items-center disabled:cursor-not-allowed"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
      >
        <ChevronDown className="size-3.5 opacity-80" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {numbers.map((n) => (
            <button
              key={n.number}
              type="button"
              className={cn("block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page", n.number === callFrom && "font-semibold")}
              onClick={() => {
                setCallFrom(n.number);
                setSmsFrom(n.number);
                setOpen(false);
              }}
            >
              {n.office} · {n.number}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}
