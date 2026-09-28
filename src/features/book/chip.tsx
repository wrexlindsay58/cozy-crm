import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { isResulted, needsResult, type BookEvent } from "./types";
import { labelTime } from "./time";
import { TYPE_TONE } from "./tone";
import { eventCreator } from "./creator";
import { ChipPop } from "./chip-pop";

const OFFICE = { PHX: "Phoenix", DFW: "Dallas" };

export function EventChip({
  e,
  selected,
  onClick,
  drag = true,
}: {
  e: BookEvent;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  thin?: boolean;
  drag?: boolean;
}) {
  const tone = TYPE_TONE[e.type] ?? TYPE_TONE.Office;
  const name = e.blank ? e.title || "Open slot" : e.title;
  const mark = needsResult(e.type);
  const done = isResulted(e.status);
  const creator = eventCreator(e);
  const light = e.type === "Block" || selected;
  const btn = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const held = useRef(false);
  const [box, setBox] = useState<DOMRect | null>(null);

  function openSoon(el: HTMLElement, wait: number, fromTouch = false) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (fromTouch) held.current = true;
      setBox(el.getBoundingClientRect());
    }, wait);
  }
  function closeSoon() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setBox(null), 200);
  }

  return (
    <>
      <button
        ref={btn}
        type="button"
        draggable={drag}
        onDragStart={
          drag
            ? (ev) => {
                ev.dataTransfer.setData("text/book-id", e.id);
                ev.dataTransfer.effectAllowed = "move";
              }
            : undefined
        }
        onMouseEnter={(ev) => openSoon(ev.currentTarget, 1000)}
        onMouseLeave={closeSoon}
        onTouchStart={(ev) => {
          held.current = false;
          openSoon(ev.currentTarget, 600, true);
        }}
        onTouchEnd={() => {
          if (!box) window.clearTimeout(timer.current);
        }}
        onClick={() => {
          if (held.current || box) {
            held.current = false;
            return;
          }
          onClick?.();
        }}
        style={
          selected || e.type === "Block"
            ? { background: e.type === "Block" && !selected ? tone.bg : "var(--color-navy)", color: "var(--color-card)", borderColor: e.type === "Block" && !selected ? tone.bar : "var(--color-navy)" }
            : { background: tone.bg, borderColor: tone.bar, color: "var(--color-ink)" }
        }
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-md border px-1.5 pt-0.5 text-left leading-4 shadow-sm",
          e.blank && !selected ? "border-dashed" : "",
          !drag && "touch-manipulation",
        )}
      >
        {mark ? <span className={cn("absolute top-1 right-1 size-1.5 rounded-full", done ? "bg-navy" : "bg-alert", selected && "bg-card")} /> : null}
        <p className="w-full shrink-0 truncate pr-2 text-[12px] font-semibold">{name}</p>
        <div className="min-h-0 flex-1 overflow-hidden">
          <p className={cn("truncate text-[10px]", light ? "text-card/80" : "text-muted")}>
            {e.type} · {OFFICE[e.office]}
          </p>
          <p className={cn("truncate text-[10px]", light ? "text-card/80" : "text-muted")}>
            {labelTime(e.start)} – {labelTime(e.end)}
          </p>
          {e.city ? <p className={cn("truncate text-[10px]", light ? "text-card/80" : "text-muted")}>{e.city}</p> : null}
          {creator ? <p className={cn("truncate text-[10px]", light ? "text-card/80" : "text-muted")}>Created by {creator}</p> : null}
          {e.notes ? <p className={cn("truncate text-[10px]", light ? "text-card/80" : "text-muted")}>{e.notes}</p> : null}
        </div>
      </button>
      {box ? (
        <ChipPop
          e={e}
          box={box}
          onEdit={() => onClick?.()}
          onClose={() => setBox(null)}
          onEnter={() => window.clearTimeout(timer.current)}
          onLeave={closeSoon}
        />
      ) : null}
    </>
  );
}