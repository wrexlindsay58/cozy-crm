import { cn } from "@/lib/cn";
import { isWatch, type BookEvent } from "./types";
import { labelTime } from "./time";

export function EventChip({
  e,
  selected,
  onClick,
  compact,
}: {
  e: BookEvent;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const watch = isWatch(e);
  return (
    <button
      type="button"
      draggable
      onDragStart={(ev) => {
        ev.dataTransfer.setData("text/book-id", e.id);
        ev.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      className={cn(
        "w-full overflow-hidden rounded-md border px-1.5 py-1 text-left",
        selected ? "border-navy bg-navy text-card" : e.blank ? "border-dashed border-line bg-page" : watch ? "border-alert bg-alert/10" : "border-line bg-card",
      )}
    >
      <p className="truncate text-[10px] font-bold tracking-wide uppercase opacity-70">{e.type}</p>
      <p className="truncate text-[12px] font-semibold leading-tight">{e.blank ? e.title || "Open slot" : e.title}</p>
      {compact ? null : (
        <p className="truncate text-[11px] opacity-80">
          {labelTime(e.start)} · {e.city || e.status}
        </p>
      )}
    </button>
  );
}
