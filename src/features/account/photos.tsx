import { useState } from "react";
import { addPhoto, useAccountPhotos } from "./store";

export function PhotoGrid({ accountId }: { accountId: string }) {
  const photos = useAccountPhotos(accountId);
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState("");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Photos</h2>
      <form className="mb-3 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); const ok = addPhoto(accountId, caption); if (!ok) { setErr("Caption required."); return; } setCaption(""); setErr(""); }}>
        <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (required)" className="h-11 flex-1 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add photo</button>
      </form>
      {err ? <p className="mb-2 text-sm text-alert">{err}</p> : null}
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {photos.map((p) => (
          <li key={p.id} className="rounded-md bg-page p-2">
            <div className="mb-1 h-16 rounded bg-line" />
            <p className="text-[11px] font-medium">{p.caption}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
