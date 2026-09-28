import { useEffect, useRef, useState, type RefObject } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isField } from "@/components/record-table/types";

export function useRowKeys<T extends { id: string }>(rows: T[], href: (row: T) => string, box: RefObject<HTMLDivElement | null>) {
  const navigate = useNavigate();
  const [active, setActive] = useState(-1);
  const rowsRef = useRef(rows);
  const hrefRef = useRef(href);
  rowsRef.current = rows;
  hrefRef.current = href;
  const index = rows.length ? Math.min(active, rows.length - 1) : 0;

  const seen = useRef(false);
  useEffect(() => {
    if (!seen.current) {
      seen.current = true;
      return;
    }
    const nodes = box.current?.querySelectorAll<HTMLElement>("[data-row-active]");
    nodes?.forEach((node) => {
      if (node.offsetParent) node.scrollIntoView({ block: "nearest" });
    });
  }, [box, index]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isField(e.target)) return;
      const list = rowsRef.current;
      if (!list.length) return;
      const current = Math.min(index, list.length - 1);
      if (e.key === "j" || e.key === "ArrowDown" || e.key === "k" || e.key === "ArrowUp") {
        if ((e.key === "ArrowDown" || e.key === "ArrowUp") && document.activeElement !== document.body && !box.current?.contains(document.activeElement)) return;
        e.preventDefault();
        const step = e.key === "j" || e.key === "ArrowDown" ? 1 : -1;
        setActive(Math.min(list.length - 1, Math.max(0, current + step)));
        return;
      }
      if (e.key === "Enter" && current >= 0) {
        const row = list[current];
        if (!row) return;
        if (e.target instanceof HTMLElement && e.target.closest("a, button")) return;
        e.preventDefault();
        void navigate({ to: hrefRef.current(row) as never });
      }
    }
    function onPointer() {
      setActive(-1);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [box, index, navigate]);

  return index;
}
