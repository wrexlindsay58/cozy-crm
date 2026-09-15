import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { placeFloat, type FloatSide } from "@/lib/place-float";

export function Float({
  anchor,
  onClose,
  prefer = "bottom",
  children,
}: {
  anchor: DOMRect;
  onClose: () => void;
  prefer?: FloatSide;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => placeFloat(anchor, 224, 200, prefer));

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(placeFloat(anchor, r.width, r.height, prefer));
  }, [anchor, prefer]);

  return createPortal(
    <>
      <button type="button" aria-label="Close" className="fixed inset-0 z-40 cursor-default bg-transparent" onClick={onClose} />
      <div
        ref={ref}
        className="fixed z-50 max-h-[min(20rem,calc(100vh-16px))] overflow-auto rounded-md border border-line bg-card py-1 shadow-sm"
        style={pos}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
