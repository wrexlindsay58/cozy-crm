import { useRef, useState } from "react";
import { addPacketPhoto, setField, setPacketNotes } from "./store";
import { useAssessCategories, type AssessCategory } from "./categories";
import { FieldInput } from "./field-input";
import { FileLightbox } from "@/features/record-shell/file-lightbox";
import { Fact, FactGrid } from "@/features/record-shell/file-sheet";
import { cn } from "@/lib/cn";
import type { Assessment, Packet } from "./types";
import type { Photo } from "@/lib/file-data";

export function PacketList({ file, readOnly = false }: { file: Assessment; readOnly?: boolean }) {
  const cats = useAssessCategories().filter((c) => c.on);
  return (
    <div className="space-y-2">
      {cats.map((def) => {
        const packet = file.packets.find((p) => p.id === def.id) ?? { id: def.id, fields: {}, photos: [], notes: "" };
        return <PacketCard key={def.id} assessmentId={file.id} def={def} packet={packet} readOnly={readOnly} />;
      })}
      {cats.length === 0 ? <p className="text-sm text-muted">No categories on. Turn them on in Settings → Assessment categories.</p> : null}
    </div>
  );
}

export function PacketCard({
  assessmentId,
  def,
  packet,
  readOnly = false,
}: {
  assessmentId: string;
  def: AssessCategory;
  packet: Packet;
  readOnly?: boolean;
}) {
  const filled = def.fields.filter((f) => packet.fields[f.label]).length;
  const [open, setOpen] = useState(true);
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
    <section className="rounded-md border border-line bg-card px-5 py-5">
      {readOnly ? (
        <header className="border-b border-line pb-4">
          <h2 className="type-section">{def.label}</h2>
          <p className="type-meta mt-1">
            {filled} of {def.fields.length} answered · {packet.photos.length} files
          </p>
        </header>
      ) : (
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <h2 className="type-section">{def.label}</h2>
        <span className="type-meta">
          {filled}/{def.fields.length} · {packet.photos.length} files
        </span>
      </button>
      )}
      {open || readOnly ? (
        <div className={readOnly ? "mt-5 space-y-5" : "mt-4 space-y-4"}>
          {readOnly ? (
            filled ? (
              <FactGrid>
                {def.fields
                  .filter((field) => packet.fields[field.label])
                  .map((field) => (
                    <Fact key={field.id} label={field.label} value={packet.fields[field.label]} wide={field.kind === "multi"} />
                  ))}
              </FactGrid>
            ) : (
              <p className="text-sm text-muted">Nothing logged in this section.</p>
            )
          ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {def.fields.map((field) => (
              <label key={field.id} className={cn("block text-sm", field.kind === "multi" && "sm:col-span-2")}>
                <span className="text-[13px] font-semibold text-ink">{field.label}</span>
                <FieldInput
                  field={field}
                  value={packet.fields[field.label] ?? ""}
                  onChange={(v) => setField(assessmentId, def.id, field.label, v)}
                  readOnly={readOnly}
                />
              </label>
            ))}
          </div>
          )}
          {readOnly && !packet.notes ? null : (
          <label className="block text-sm">
            <span className="text-[13px] font-semibold text-ink">Notes</span>
            {readOnly ? (
              <p className="mt-1.5 text-[15px] leading-snug">{packet.notes}</p>
            ) : (
              <textarea
                value={packet.notes}
                onChange={(e) => setPacketNotes(assessmentId, def.id, e.target.value)}
                rows={3}
                placeholder={`Measured / observed on ${def.label.toLowerCase()}.`}
                className="mt-1.5 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
              />
            )}
          </label>
          )}
          {readOnly ? null : (
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
              accept="image/*,video/*,audio/*,.pdf,.heic,.mov,.m4a,.mp3,.wav"
              className="h-11 max-w-full text-sm file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-navy file:px-3 file:text-sm file:font-semibold file:text-card"
            />
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Data plate, hatch, register, leak"
              className="h-11 min-w-0 flex-1 rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
            />
            <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
              Add
            </button>
          </form>
          )}
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
