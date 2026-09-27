import { toggleReaction } from "@/features/thread/store";
import { actingName } from "@/features/staff/store";
import { cn } from "@/lib/cn";
import type { ThreadMessage } from "@/lib/file-data";
import { Tip } from "@/components/tip";
import { QUICK_EMOJI } from "./part-01";

export function EmojiPicker({ msg, light }: { msg: ThreadMessage; light: boolean }) {
  const grouped = QUICK_EMOJI.map((emoji) => {
    const people = (msg.reactions ?? []).filter((r) => r.emoji === emoji);
    return { emoji, people, mine: people.some((p) => p.by === actingName()) };
  });
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {grouped.map(({ emoji, people, mine }) => (
        <Tip key={emoji} label={people.length ? people.map((p) => p.by.split(" ")[0]).join(", ") : emoji === "👍" ? "Thumbs up" : "React"} on side="bottom">
          <button
            type="button"
            aria-label={emoji === "👍" ? "Thumbs up" : `React ${emoji}`}
            onClick={() => toggleReaction(msg.id, emoji)}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-1.5 text-sm",
              mine ? "bg-navy text-card" : light ? "bg-card/15 text-card" : "border border-line bg-card",
            )}
          >
            {emoji}
            {people.length > 0 ? <span className="text-[11px] font-semibold">{people.length}</span> : null}
          </button>
        </Tip>
      ))}
    </div>
  );
}
