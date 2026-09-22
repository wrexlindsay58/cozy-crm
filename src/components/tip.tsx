import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { placeFloat, type FloatSide } from "@/lib/place-float";

export function Tip({
  label,
  on,
  side = "bottom",
  wide,
  className,
  children,
}: {
  label: string;
  on: boolean;
  side?: FloatSide;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [box, setBox] = useState<DOMRect | null>(null);
  if (!on) return children;
  const w = wide
    ? Math.min(400, Math.max(220, Math.min(label.length * 8 + 32, 400)))
    : Math.min(280, Math.max(72, label.length * 7 + 24));
  const lines = wide ? Math.max(1, Math.ceil(label.length / 36)) : 1;
  const h = wide ? lines * 24 + 20 : 30;
  const style = box ? placeFloat(box, w, h, side) : undefined;
  function show(el: HTMLElement) {
    setBox(el.getBoundingClientRect());
  }
  return (
    <span
      className={cn("inline-flex max-w-full", className)}
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
            <span
              className={cn(
                "pointer-events-none fixed z-[80] text-card",
                wide
                  ? "rounded-md bg-ink px-3.5 py-2.5 text-[13px] font-medium leading-6 whitespace-pre-wrap"
                  : "whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[12px] font-semibold",
              )}
              style={{ ...style, width: wide ? w : "max-content" }}
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}