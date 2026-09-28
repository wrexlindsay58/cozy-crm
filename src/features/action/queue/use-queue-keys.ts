import { useEffect, type RefObject } from "react";
import { isField } from "@/components/record-table/types";

export function useQueueKeys(
  rows: { id: string }[],
  activeId: string | undefined,
  move: (id: string) => void,
  box: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const node = box.current?.querySelector<HTMLElement>("[data-row-active]");
    if (node?.offsetParent) node.scrollIntoView({ block: "nearest" });
  }, [box, activeId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isField(e.target) || !rows.length) return;
      const idx = rows.findIndex((r) => r.id === activeId);
      const arrows = e.key === "ArrowDown" || e.key === "ArrowUp";
      const stepKey = e.key === "j" || e.key === "ArrowDown" || e.key === "k" || e.key === "ArrowUp";
      if (stepKey) {
        const inside = box.current?.contains(document.activeElement) ?? false;
        if (arrows && document.activeElement !== document.body && !inside) return;
        e.preventDefault();
        if (idx < 0) {
          move(rows[0].id);
          return;
        }
        const step = e.key === "j" || e.key === "ArrowDown" ? 1 : -1;
        const next = rows[Math.min(rows.length - 1, Math.max(0, idx + step))];
        if (next && next.id !== rows[idx]?.id) move(next.id);
        return;
      }
      if (e.key !== "Enter") return;
      const row = rows[idx < 0 ? 0 : idx];
      if (!row) return;
      if (e.target instanceof HTMLElement && e.target.closest("a, button")) return;
      e.preventDefault();
      move(row.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rows, activeId, move, box]);
}
