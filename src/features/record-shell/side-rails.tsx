import { useRef, useState } from "react";
import { addPhoto, kindFromFile, kindWord, usePhotos } from "@/features/photos/store";
import { FileLightbox } from "./file-lightbox";
import type { Activity, Ticket } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";

export function TicketRail({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="border-t border-line p-3">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Tickets</h2>
      {tickets.length === 0 ? <p className="mt-2 text-sm text-muted">None on this file.</p> : null}
      <ul className="mt-2 space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="text-sm">
            <p className="font-semibold">{t.title}</p>
            <p className="text-[11px] text-muted">
              {t.owner} · {t.status} · {t.age}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PhotoRail({ personId, photos: seed }: { personId: string; photos?: Photo[] }) {
  const live = usePhotos(personId);
  const photos = live.length ? live : (seed ?? []);
  const [caption, setCaption] = useState("");
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    if (!caption.trim()) setCaption(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  }

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Media</h2>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
        onSubmit={(e) => {
          e.preventDefault();
          const file = fileRef.current?.files?.[0];
          if (!file && !caption.trim()) return;
          if (file) {
            const kind = kindFromFile(file);
            const reader = new FileReader();
            reader.onload = () => {
              addPhoto(personId, caption, typeof reader.result === "string" ? reader.result : undefined, kind, file.name);
              setCaption("");
              setFileName("");
              if (fileRef.current) fileRef.current.value = "";
            };
            reader.readAsDataURL(file);
            return;
          }
          addPhoto(personId, caption);
          setCaption("");
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.heic,.mov"
          className="h-11 max-w-full text-sm file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-navy file:px-3 file:text-sm file:font-semibold file:text-card"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={fileName || "Attic, unit, HOA letter"}
          className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add
        </button>
      </form>
      {photos.length === 0 ? <p className="mt-3 text-sm text-muted">None on this file.</p> : null}
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="w-full overflow-hidden rounded-md bg-page text-left"
              onClick={() => setOpen(i)}
            >
              {p.src && (p.kind ?? "photo") === "photo" ? (
                <img src={p.src} alt="" className="h-28 w-full object-cover" />
              ) : p.src && p.kind === "video" ? (
                <video src={p.src} muted className="h-28 w-full object-cover" />
              ) : (
                <div className="grid h-28 place-items-center bg-line px-2 text-center text-[11px] font-semibold text-muted">
                  {kindWord(p.kind)}
                </div>
              )}
              <p className="px-2 py-1.5 text-[11px] font-medium">{p.caption}</p>
            </button>
          </li>
        ))}
      </ul>
      {open !== null ? (
        <FileLightbox files={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      ) : null}
    </section>
  );
}

export function HistoryList({ history, flush }: { history: Activity[]; flush?: boolean }) {
  const body = (
    <>
      {history.length === 0 ? <p className="text-sm text-muted">Nothing logged yet.</p> : null}
      <ol className="space-y-3">
        {history.map((a) => (
          <li key={`${a.at}-${a.what}`} className="border-l-2 border-line pl-3">
            <p className="text-[11px] font-semibold text-muted">
              {a.at} · {a.who}
            </p>
            <p className="text-sm">{a.what}</p>
          </li>
        ))}
      </ol>
    </>
  );
  if (flush) return body;
  return (
    <section className="mt-4 rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">History</h2>
      {body}
    </section>
  );
}
