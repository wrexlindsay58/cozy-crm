import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { addPhoto, kindFromFile, kindWord, photosOnAction, usePhotos } from "@/features/photos/store";
import { cn } from "@/lib/cn";
import { FileLightbox } from "./file-lightbox";
import { CommentBox } from "./comment-box";
import type { Activity, Ticket } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";

export function TicketRail({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="border-t border-line p-3">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Actions</h2>
      {tickets.length === 0 ? <p className="mt-2 text-sm text-muted">None on this file.</p> : null}
      <ul className="mt-2 space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="text-sm">
            <a href={`/tickets/${t.id}`} className="font-semibold text-navy">
              {t.title}
            </a>
            <p className="text-[11px] text-muted">
              {t.owner} · {t.status} · {t.age}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PhotoRail({
  personId,
  photos: seed,
  flush,
  actionId,
  actionKind,
  actionIds,
  scope = "house",
  onScope,
}: {
  personId: string;
  photos?: Photo[];
  flush?: boolean;
  actionId?: string;
  actionKind?: "ticket" | "task" | "request";
  actionIds?: string[];
  scope?: "action" | "house";
  onScope?: (next: "action" | "house") => void;
}) {
  const live = usePhotos(personId);
  const all = live.length ? live : (seed ?? []);
  const ids = scope === "action" && actionIds?.length ? actionIds : undefined;
  const photos = photosOnAction(all, ids);
  const [caption, setCaption] = useState("");
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const word = actionKind ?? "ticket";
  const showScope = Boolean(actionId && onScope);

  function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    if (!caption.trim()) setCaption(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  }

  function save(file?: File) {
    if (file) {
      const kind = kindFromFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        addPhoto(
          personId,
          caption,
          typeof reader.result === "string" ? reader.result : undefined,
          kind,
          file.name,
          actionId && scope === "action" ? { actionId } : undefined,
        );
        setCaption("");
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
      };
      reader.readAsDataURL(file);
      return;
    }
    if (!caption.trim()) return;
    addPhoto(personId, caption, undefined, "photo", undefined, actionId && scope === "action" ? { actionId } : undefined);
    setCaption("");
  }

  return (
    <section className={flush ? "flex h-full min-h-0 flex-col" : "rounded-md border border-line bg-card p-4"}>
      {flush ? null : <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Media & Files</h2>}
      {showScope ? (
        <button
          type="button"
          onClick={() => onScope?.(scope === "action" ? "house" : "action")}
          className="shrink-0 border-b border-line bg-page px-3 py-2 text-left"
        >
          <p className="text-[12px] font-semibold text-navy">
            {scope === "action" ? "View all media on this house" : `Back to this ${word}`}
          </p>
          <p className="text-[11px] text-muted">
            {scope === "action" ? `${photos.length} on this ${word}` : `All files · ${all.length}`}
          </p>
        </button>
      ) : null}
      <div className={flush ? "min-h-0 flex-1 overflow-auto p-3" : ""}>
        <form
          className={cn("flex flex-col gap-2", flush ? "" : "mt-3 sm:flex-row sm:flex-wrap")}
          onSubmit={(e) => {
            e.preventDefault();
            save(fileRef.current?.files?.[0]);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.heic,.mov"
            className={flush ? "sr-only" : "h-11 max-w-full text-sm file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-navy file:px-3 file:text-sm file:font-semibold file:text-card"}
            aria-hidden={flush || undefined}
            tabIndex={flush ? -1 : undefined}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {flush ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-11 w-full truncate rounded-md border border-line px-3 text-left text-sm font-semibold"
            >
              {fileName || "Choose photo, video, or file"}
            </button>
          ) : null}
          <div className={cn("flex gap-2", flush ? "" : "min-w-0 flex-1")}>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={fileName || "Attic, unit, HOA letter"}
              className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
            <button type="submit" className="h-11 shrink-0 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Add
            </button>
          </div>
        </form>
        {photos.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            {scope === "action" && actionId ? `Nothing on this ${word} yet.` : "None on this file."}
          </p>
        ) : null}
        <ul className={cn("mt-3 grid grid-cols-2 gap-2", !flush && "md:grid-cols-3")}>
          {photos.map((p, i) => (
            <MediaTile key={p.id} photo={p} onOpen={() => setOpen(i)} />
          ))}
        </ul>
      </div>
      {open !== null ? (
        <FileLightbox files={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </section>
  );
}

function MediaTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const [talk, setTalk] = useState(false);
  return (
    <li className="rounded-md bg-page">
      <button type="button" className="w-full overflow-hidden text-left" onClick={onOpen}>
        {photo.src && (photo.kind ?? "photo") === "photo" ? (
          <img src={photo.src} alt="" className="h-28 w-full object-cover" />
        ) : photo.src && photo.kind === "video" ? (
          <video src={photo.src} muted className="h-28 w-full object-cover" />
        ) : (
          <div className="grid h-28 place-items-center bg-line px-2 text-center text-[11px] font-semibold text-muted">
            {kindWord(photo.kind)}
          </div>
        )}
        <p className="px-2 py-1.5 text-[11px] font-medium">{photo.caption}</p>
      </button>
      <button
        type="button"
        aria-label="Comment"
        className="flex h-10 w-full items-center justify-center gap-1 text-[11px] font-semibold text-navy"
        onClick={() => setTalk((v) => !v)}
      >
        <MessageSquare className="size-3.5" />
        Comment
      </button>
      {talk ? <div className="px-2 pb-2"><CommentBox personId={photo.personId} nest={{ kind: "media", id: photo.id, title: photo.caption }} /></div> : null}
    </li>
  );
}

export function HistoryList({ history, flush }: { history: Activity[]; flush?: boolean }) {
  const groups = groupByDay(history);
  const body =
    history.length === 0 ? (
      <p className="text-sm text-muted">Nothing logged yet.</p>
    ) : (
      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.day}>
            <h3 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">{g.day}</h3>
            <ol className="relative ml-2 border-l-2 border-line">
              {g.rows.map((a) => (
                <li key={`${a.at}-${a.what}`} className="relative pb-4 pl-5 last:pb-0">
                  <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-navy" />
                  <p className="text-[11px] font-semibold text-muted">
                    {timeOf(a.at)} · {a.who}
                  </p>
                  <p className="mt-0.5 text-sm">{a.what}</p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    );
  if (flush) return body;
  return (
    <section className="mt-4 rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">History</h2>
      {body}
    </section>
  );
}

function timeOf(at: string) {
  const bits = at.split(" ");
  return bits.length > 2 ? bits.slice(2).join(" ") : at;
}

function groupByDay(history: Activity[]) {
  const map = new Map<string, Activity[]>();
  for (const a of history) {
    const day = a.at.split(" ").slice(0, 2).join(" ") || a.at;
    const rows = map.get(day) ?? [];
    rows.push(a);
    map.set(day, rows);
  }
  return [...map.entries()].map(([day, rows]) => ({ day, rows }));
}
