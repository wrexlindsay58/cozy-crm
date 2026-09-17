import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { isWatch, type BookEvent } from "./types";
import { labelTime } from "./time";
import { TYPE_TONE } from "./tone";

export function EventChip({
  e,
  selected,
  onClick,
  compact,
  thin,
}: {
  e: BookEvent;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  thin?: boolean;
}) {
  const watch = isWatch(e);
  const tone = TYPE_TONE[e.type] ?? TYPE_TONE.Office;
  const name = e.blank ? e.title || "Open slot" : e.title;
  const tip = [e.type, name, `${labelTime(e.start)} ${e.city || e.status}`].filter(Boolean).join(" · ");
  const btn = (
    <button
      type="button"
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/book-id", e.id);
        ev.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      style={
        selected
          ? { background: "var(--color-navy)", color: "var(--color-card)", borderColor: "var(--color-navy)" }
          : { background: tone.bg, borderColor: tone.bar, color: "var(--color-ink)" }
      }
      className={cn(
        "h-full w-full overflow-hidden rounded-md border px-1.5 py-0.5 text-left shadow-sm",
        e.blank && !selected ? "border-dashed" : "",
        watch && !selected ? "ring-1 ring-alert/40" : "",
      )}
    >
      <p className="truncate text-[10px] font-bold tracking-wide uppercase opacity-70">{e.type}</p>
      <p className="truncate text-[12px] font-semibold leading-tight">{name}</p>
      {compact || thin ? null : (
        <p className="truncate text-[11px] opacity-80">
          {labelTime(e.start)} · {e.city || e.status}
        </p>
      )}
    </button>
  );
  return (
    <Tip label={tip} on={Boolean(thin)} side="top" className="flex h-full w-full">
      {btn}
    </Tip>
  );
}
