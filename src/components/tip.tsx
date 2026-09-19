import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { placeFloat, type FloatSide } from "@/lib/place-float";

export function Tip({
  label,
  on,
  side = "bottom",
  className,
  children,
}: {
  label: string;
  on: boolean;
  side?: FloatSide;
  className?: string;
  children: ReactNode;
}) {
  const [box, setBox] = useState<DOMRect | null>(null);
  if (!on) return children;
  const w = Math.min(280, Math.max(48, label.length * 7 + 16));
  const style = box ? placeFloat(box, w, 28, side) : undefined;
  function show(el: HTMLElement) {
    setBox(el.getBoundingClientRect());
  }
  return (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setBox(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={() => setBox(null)}
      onPointerDown={(e) => {
        if (window.matchMedia("(hover: none)").matches) show(e.currentTarget);
      }}
    >
      {children}
      {box && style
        ? createPortal(
            <span className="pointer-events-none fixed z-50 max-w-[min(280px,calc(100vw-16px))] rounded-md bg-ink px-2 py-1 text-[11px] font-semibold text-card" style={style}>
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
