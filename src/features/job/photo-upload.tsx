import { useState } from "react";
import { ImagePlus } from "lucide-react";
import type { ScopeMedia } from "./types";
import { cn } from "@/lib/cn";
import { FILL_IN } from "./fill-row";

export function CaptionedUpload({
  files,
  onAdd,
}: {
  files: ScopeMedia[];
  onAdd: (file: File, caption: string, purpose: string) => void;
}) {
  const [caption, setCaption] = useState("");
  const [purpose, setPurpose] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const look = files.find((f) => f.id === open);
  const ready = caption.trim() && purpose.trim();

  return (
    <div className="mt-2">
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Photos</p>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" className={FILL_IN} />
        <input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="What this is for" className={FILL_IN} />
      </div>
      <label
        className={cn(
          "mt-2 inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold",
          ready ? "bg-navy text-card" : "border border-line text-muted",
        )}
      >
        <ImagePlus className="size-3.5" />
        Upload
        <input
          type="file"
          accept="image/*,video/*"
          disabled={!ready}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && ready) {
              onAdd(f, caption.trim(), purpose.trim());
              setCaption("");
              setPurpose("");
            }
            e.target.value = "";
          }}
        />
      </label>
      {!ready ? <p className="mt-1 text-[11px] text-muted">Caption and purpose before the file.</p> : null}
      {files.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((m) => (
            <li key={m.id} className="w-20">
              <button type="button" onClick={() => setOpen(m.id)} className="relative h-14 w-20 overflow-hidden rounded-md border border-line">
                {m.kind === "photo" ? <img src={m.url} alt={m.caption || m.name} className="size-full object-cover" /> : <span className="grid size-full place-items-center bg-page text-[9px] font-bold">FILE</span>}
              </button>
              <p className="mt-0.5 truncate text-[10px] font-semibold">{m.caption || m.name}</p>
              {m.purpose ? <p className="truncate text-[10px] text-muted">{m.purpose}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {look ? (
        <button type="button" className="fixed inset-0 z-50 grid place-items-center bg-navy/70 p-6" onClick={() => setOpen(null)}>
          {look.kind === "video" ? (
            <video src={look.url} controls className="max-h-[90vh] max-w-full rounded-md" />
          ) : (
            <div className="max-w-3xl">
              <img src={look.url} alt={look.caption || look.name} className="max-h-[80vh] max-w-full rounded-md" />
              <p className="mt-2 text-sm font-semibold text-card">{look.caption || look.name}</p>
              {look.purpose ? <p className="text-[12px] text-card/80">{look.purpose}</p> : null}
            </div>
          )}
        </button>
      ) : null}
    </div>
  );
}
