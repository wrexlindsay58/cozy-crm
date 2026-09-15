import { useState } from "react";
import { addPacketPhoto, setField } from "./store";
import { PACKET_DEFS, type Assessment, type PacketId } from "./types";

export function PacketList({ file }: { file: Assessment }) {
  return (
    <div className="space-y-3">
      {PACKET_DEFS.map((def) => {
        const packet = file.packets.find((p) => p.id === def.id);
        if (!packet) return null;
        return <PacketCard key={def.id} assessmentId={file.id} def={def} packet={packet} />;
      })}
    </div>
  );
}

function PacketCard({
  assessmentId,
  def,
  packet,
}: {
  assessmentId: string;
  def: (typeof PACKET_DEFS)[number];
  packet: Assessment["packets"][number];
}) {
  const filled = def.fields.filter((f) => packet.fields[f]).length;
  const [open, setOpen] = useState(def.id === "hvac" || def.id === "attic");
  const [caption, setCaption] = useState("");
  const [err, setErr] = useState("");
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">{def.label}</h2>
        <span className="text-xs text-muted">{filled}/{def.fields.length} · {packet.photos.length} photos</span>
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          {def.fields.map((field) => (
            <label key={field} className="block text-sm">
              <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{field}</span>
              <input value={packet.fields[field] ?? ""} onChange={(e) => setField(assessmentId, def.id as PacketId, field, e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm" />
            </label>
          ))}
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); const ok = addPacketPhoto(assessmentId, def.id as PacketId, caption); if (!ok) { setErr("Name it."); return; } setCaption(""); setErr(""); }}>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Attic hatch, unit tag" className="h-11 flex-1 rounded-md border border-line px-3 text-sm" />
            <button type="submit" className="h-11 rounded-md border border-line px-3 text-sm font-semibold">Add</button>
          </form>
          {err ? <p className="text-sm text-alert">{err}</p> : null}
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {packet.photos.map((ph) => (
              <li key={ph.id} className="rounded-md bg-page p-2">
                <div className="mb-1 h-14 rounded bg-line" />
                <p className="text-[11px] font-medium">{ph.caption}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
