import { useRef, useState } from "react";
import { addPacketPhoto, setField, setPacketNotes } from "./store";
import { useAssessCategories, type AssessCategory } from "./categories";
import { FileLightbox } from "@/features/record-shell/file-lightbox";
import type { Assessment, Packet } from "./types";
import type { Photo } from "@/lib/file-data";

export function PacketList({ file }: { file: Assessment }) {
  const cats = useAssessCategories().filter((c) => c.on);
  return (
    <div className="space-y-3">
      {cats.map((def) => {
        const packet = file.packets.find((p) => p.id === def.id) ?? { id: def.id, fields: {}, photos: [], notes: "" };
        return <PacketCard key={def.id} assessmentId={file.id} def={def} packet={packet} />;
      })}
      {cats.length === 0 ? <p className="text-sm text-muted">No categories on. Turn them on in Settings → Assessment categories.</p> : null}
    </div>
  );
}

function PacketCard({
  assessmentId,
  def,
  packet,
}: {
  assessmentId: string;
  def: AssessCategory;
  packet: Packet;
}) {
  const filled = def.fields.filter((f) => packet.fields[f.label]).length;
  const [open, setOpen] = useState(filled > 0 || Boolean(packet.notes) || packet.photos.length > 0);
  const [caption, setCaption] = useState("");
  const [look, setLook] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const media: Photo[] = packet.photos.map((p) => ({
    id: p.id,
    personId: assessmentId,
    caption: p.caption,
    tone: "info",
    src: p.src,
    kind: p.kind,
    name: p.name,
  }));

  return (
    <section className="rounded-md border border-line bg-card p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">{def.label}</h2>
        <span className="text-[11px] text-muted">
          {filled}/{def.fields.length} · {packet.photos.length} files
        </span>
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          {def.fields.map((field) => (
            <label key={field.id} className="block text-sm">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{field.label}</span>
              <input
                value={packet.fields[field.label] ?? ""}
                onChange={(e) => setField(assessmentId, def.id, field.label, e.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Notes</span>
            <textarea
              value={packet.notes}
              onChange={(e) => setPacketNotes(assessmentId, def.id, e.target.value)}
              rows={3}
              placeholder={`What we saw on ${def.label.toLowerCase()}.`}
              className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
            />
          </label>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const file = fileRef.current?.files?.[0];
              const ok = addPacketPhoto(assessmentId, def.id, caption, file, def.label);
              if (!ok) return;
              setCaption("");
              if (fileRef.current) fileRef.current.value = "";
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.heic,.mov"
              className="h-11 max-w-full text-sm file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-navy file:px-3 file:text-sm file:font-semibold file:text-card"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Hatch, unit tag, leak"
              className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
            <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Add
            </button>
          </form>
          {packet.photos.length ? (
            <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {packet.photos.map((ph, i) => (
                <li key={ph.id}>
                  <button type="button" className="w-full overflow-hidden rounded-md bg-page text-left" onClick={() => setLook(i)}>
                    {ph.src && (ph.kind ?? "photo") === "photo" ? (
                      <img src={ph.src} alt="" className="h-24 w-full object-cover" />
                    ) : (
                      <div className="grid h-24 place-items-center bg-line text-[11px] font-semibold text-muted">{ph.kind ?? "file"}</div>
                    )}
                    <p className="px-2 py-1.5 text-[11px] font-medium">{ph.caption}</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {look !== null ? <FileLightbox files={media} index={look} onIndex={setLook} onClose={() => setLook(null)} /> : null}
        </div>
      ) : null}
    </section>
  );
}
