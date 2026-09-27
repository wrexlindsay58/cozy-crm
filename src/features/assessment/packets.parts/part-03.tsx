import { addPacketPhoto, setPacketNotes } from "../store";
import { fieldCaption } from "../categories";
import { FileLightbox } from "@/features/record-shell/file-lightbox";
import { Fact, FactGrid } from "@/features/record-shell/file-sheet";
import { returnSizeFacts } from "./part-01";
import { hatchFacts, PacketCardView } from "./part-02";

export function PacketCardView2(props: { bag: { readOnly: any; filled: any; def: any; packet: any; assessmentId: any; fileRef: any; caption: any; setCaption: any; setLook: any; look: any; media: any } }) {
  const { readOnly, filled, def, packet, assessmentId, fileRef, caption, setCaption, setLook, look, media } = props.bag;
  return (
    <div className={readOnly ? "mt-5 space-y-5" : "mt-4 space-y-4"}>
          {readOnly ? (
            filled ? (
              <FactGrid>
                {def.fields
                  .filter((field: any) => packet.fields[field.label])
                  .map((field: any) => (
                    <Fact key={field.id} label={fieldCaption(field)} value={packet.fields[field.label]} wide={field.kind === "multi"} />
                  ))}
                {def.id === "attic"
                  ? hatchFacts(packet).map((row) => <Fact key={row.label} label={row.label} value={row.value} />)
                  : null}
                {def.id === "ducts"
                  ? returnSizeFacts(packet).map((row) => <Fact key={row.label} label={row.label} value={row.value} />)
                  : null}
              </FactGrid>
            ) : (
              <p className="text-sm text-muted">Nothing logged in this section.</p>
            )
          ) : (
          <PacketCardView bag={{ def, packet, assessmentId, readOnly }} />
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
              {packet.photos.map((ph: any, i: any) => (
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
  );
}
