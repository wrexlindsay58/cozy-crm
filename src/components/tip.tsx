import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export function Tip({
  label,
  on,
  side = "bottom",
  className,
  children,
}: {
  label: string;
  on: boolean;
  side?: "bottom" | "right";
  className?: string;
  children: ReactNode;
}) {
  const [box, setBox] = useState<DOMRect | null>(null);
  if (!on) return children;
  return (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={(e) => setBox(e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setBox(null)}
      onFocus={(e) => setBox(e.currentTarget.getBoundingClientRect())}
      onBlur={() => setBox(null)}
    >
      {children}
      {box
        ? createPortal(
            <span
              className="pointer-events-none fixed z-50 rounded-md bg-ink px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-card"
              style={
                side === "right"
                  ? { top: box.top + box.height / 2, left: box.right + 8, transform: "translateY(-50%)" }
                  : { top: box.bottom + 6, left: box.left + box.width / 2, transform: "translateX(-50%)" }
              }
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
