import { useRef, useState } from "react";
import type { MediaTag, ScopeMedia } from "../types";
import { cn } from "@/lib/cn";
import { SEC_HEAD } from "../fill-row";
import { MediaAddView } from "./part-02";

export function MediaAdd({
  onAdd,
}: {
  onAdd: (file: File, meta: { name: string; caption: string; tag: MediaTag }) => void;
}) {
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState<MediaTag | "">("");
  const [tried, setTried] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const ready = Boolean(caption.trim() && title.trim() && tag);
  const miss = tried && !ready;
  const why = !caption.trim() && !title.trim() && !tag
    ? "Need description, media name, and a tag before upload."
    : !caption.trim()
      ? "Need a description before upload."
      : !title.trim()
        ? "Need a media name before upload."
        : "Need a tag before upload.";

  function go() {
    if (!ready) {
      setTried(true);
      return;
    }
    fileRef.current?.click();
  }

  return (
    <MediaAddView bag={{ caption, setCaption, tried, setTried, miss, title, setTitle, tag, setTag, go, ready, fileRef, onAdd, why }} />
  );
}

export function MediaStrip({
  files,
  onAdd,
  label = "Photos",
}: {
  files: ScopeMedia[];
  onAdd: (file: File, meta: { name: string; caption: string; tag: MediaTag }) => void;
  label?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const look = files.find((f) => f.id === open);

  return (
    <div className="mt-3 w-full min-w-0 overflow-visible">
      <p className={SEC_HEAD}>{label}</p>
      <div className="mt-1.5">
        <MediaAdd onAdd={onAdd} />
      </div>
      {files.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {files.map((m) => (
            <li key={m.id} className="w-20">
              <button type="button" onClick={() => setOpen(m.id)} className="relative h-14 w-20 overflow-hidden rounded-md border border-line">
                {m.kind === "photo" ? <img src={m.url} alt={m.caption || m.name} className="size-full object-cover" /> : <span className={cn("grid size-full place-items-center bg-page text-[9px] font-bold")}>{m.kind === "video" ? "VID" : "FILE"}</span>}
              </button>
              <p className="mt-0.5 truncate text-[10px] font-semibold">{m.name}</p>
              <p className="truncate text-[10px] text-muted">{m.purpose || m.cat}</p>
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
              <p className="mt-2 text-sm font-semibold text-card">{look.name}</p>
              <p className="text-[12px] text-card/80">
                {look.caption}
                {look.purpose ? ` · ${look.purpose}` : ""}
              </p>
            </div>
          )}
        </button>
      ) : null}
    </div>
  );
}
