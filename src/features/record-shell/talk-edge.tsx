import { useEffect, useRef } from "react";
import { ChevronLeft, MessageSquare } from "lucide-react";

export function TalkEdge({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const start = useRef<{ x: number; y: number; block: boolean } | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    function began(e: TouchEvent) {
      if (wide.matches) return;
      const t = e.target instanceof Element ? e.target : null;
      const block = Boolean(t?.closest("input, textarea, select, [data-no-swipe], .overflow-x-auto"));
      const touch = e.changedTouches[0];
      start.current = touch ? { x: touch.clientX, y: touch.clientY, block } : null;
    }
    function ended(e: TouchEvent) {
      const from = start.current;
      start.current = null;
      if (!from || from.block || wide.matches) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - from.x;
      const dy = touch.clientY - from.y;
      if (Math.abs(dy) > Math.abs(dx) * 0.8) return;
      if (!open && dx < -64) onOpen();
      if (open && dx > 64) onClose();
    }
    window.addEventListener("touchstart", began, { passive: true });
    window.addEventListener("touchend", ended, { passive: true });
    return () => {
      window.removeEventListener("touchstart", began);
      window.removeEventListener("touchend", ended);
    };
  }, [open, onOpen, onClose]);

  if (open) return null;
  return (
    <button
      type="button"
      aria-label="Open conversation"
      onClick={onOpen}
      className="fixed top-1/2 right-0 z-30 flex h-14 w-6 -translate-y-1/2 flex-col items-center justify-center gap-0.5 rounded-l-md bg-navy text-card shadow-md md:hidden"
    >
      <ChevronLeft className="size-3.5" />
      <MessageSquare className="size-3.5" />
    </button>
  );
}
