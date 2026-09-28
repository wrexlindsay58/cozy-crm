import { useState } from "react";
import { cn } from "@/lib/cn";
import { patchBook } from "./store";
import { resultsFor } from "./results";
import type { BookEvent } from "./types";

export function ResultPick({ e, onClose }: { e: BookEvent; onClose: () => void }) {
  const choices = resultsFor(e.type);
  const [id, setId] = useState(e.result ?? "");
  const [note, setNote] = useState(e.resultNote ?? "");
  const picked = choices.find((c) => c.id === id);
  const groups = Array.from(new Set(choices.map((c) => c.group)));
  const blocked = Boolean(picked && picked.reason === "required" && !note.trim());

  return (
    <form
      className="mt-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!picked || blocked) return;
        patchBook(e.id, { result: picked.id, resultNote: note.trim(), status: picked.status });
        onClose();
      }}
    >
      <div className="max-h-36 overflow-auto">
        {groups.map((group) => (
          <div key={group || "all"}>
            {group ? <p className="px-1 pt-1 text-[10px] font-bold tracking-wide text-muted uppercase">{group}</p> : null}
            {choices.filter((c) => c.group === group).map((c) => (
              <button key={c.id} type="button" onClick={() => setId(c.id)} className={cn("block w-full rounded px-1 py-0.5 text-left text-[12px]", id === c.id ? "bg-navy text-card" : "hover:bg-page")}>
                {c.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      {picked ? (
        <div className="mt-2 flex gap-1">
          <input value={note} onChange={(ev) => setNote(ev.target.value)} placeholder={picked.reason === "required" ? "Reason" : "Reason, optional"} className="h-7 min-w-0 flex-1 rounded-md border border-line px-2 text-[12px] outline-none" />
          <button type="submit" disabled={blocked} className="h-7 rounded-md border border-line px-2 text-[11px] font-semibold text-navy disabled:opacity-40">Save</button>
        </div>
      ) : null}
    </form>
  );
}
