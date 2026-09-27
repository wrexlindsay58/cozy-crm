import { cn } from "@/lib/cn";
import { FileLightbox } from "../file-lightbox";
import { MediaTile } from "./part-01";

export function PhotoRailView(props: { bag: { flush: any; showScope: any; onScope: any; scope: any; word: any; photos: any; all: any; save: any; fileRef: any; onFile: any; fileName: any; caption: any; setCaption: any; actionId: any; setOpen: any; open: any } }) {
  const { flush, showScope, onScope, scope, word, photos, all, save, fileRef, onFile, fileName, caption, setCaption, actionId, setOpen, open } = props.bag;
  return (
    <section className={flush ? "flex h-full min-h-0 flex-col" : "rounded-md border border-line bg-card p-4"}>
      {flush ? null : <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Media & Files</h2>}
      {showScope ? (
        <button
          type="button"
          onClick={() => onScope?.(scope === "action" ? "house" : "action")}
          className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-page px-3 py-2 text-left"
        >
          <p className="min-w-0 truncate text-[12px] font-semibold text-navy">
            {scope === "action" ? "View all media on this house" : `Back to this ${word}`}
          </p>
          <p className="shrink-0 text-[11px] text-muted">
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
          {photos.map((p: any, i: any) => (
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
