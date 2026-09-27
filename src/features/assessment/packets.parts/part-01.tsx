import { useRef, useState } from "react";
import { setField } from "../store";
import { useAssessCategories, type AssessCategory, type AssessField } from "../categories";
import type { Assessment, Packet } from "../types";
import type { Photo } from "@/lib/file-data";
import { PacketCardView2 } from "./part-03";

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
        <PacketCardView2 bag={{ readOnly, filled, def, packet, assessmentId, fileRef, caption, setCaption, setLook, look, media }} />
      ) : null}
    </section>
  );
}

export function returnSizeFacts(packet: Packet) {
  const count = Math.max(0, Math.min(8, Number(packet.fields["Return registers (count)"]) || 0));
  const rows: { label: string; value: string }[] = [];
  for (let i = 1; i <= count; i += 1) {
    const label = `Return ${i} size`;
    const value = (packet.fields[label] || (i === 1 ? packet.fields["Return size"] : "") || "").trim();
    if (value) rows.push({ label, value });
  }
  return rows;
}

export function ReturnSizes({ assessmentId, packet, readOnly }: { assessmentId: string; packet: Packet; readOnly: boolean }) {
  const count = Math.max(0, Math.min(8, Number(packet.fields["Return registers (count)"]) || 0));
  if (!count) return null;
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const label = `Return ${index + 1} size`;
        const value = packet.fields[label] ?? (index === 0 ? packet.fields["Return size"] ?? "" : "");
        return (
          <label key={label} className="block text-sm">
            <span className="text-[13px] font-semibold text-ink">{label}</span>
            {readOnly ? (
              <p className="mt-1.5 text-[15px] leading-snug">{value || "—"}</p>
            ) : (
              <input
                value={value}
                onChange={(e) => setField(assessmentId, "ducts", label, e.target.value)}
                placeholder="16x25"
                className="mt-1.5 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
              />
            )}
          </label>
        );
      })}
    </>
  );
}

export const HATCH_TYPE: AssessField = { id: "hatch-type", label: "Hatch type", kind: "select", options: ["Ladder", "Drywall / wood only", "Gable"] };

export const HATCH_INSULATED: AssessField = { id: "hatch-insulated", label: "Hatch insulated?", kind: "select", options: ["Yes", "No", "NA"] };

export const HATCH_SEALED: AssessField = { id: "hatch-sealed", label: "Hatch sealed?", kind: "select", options: ["Yes", "No", "NA"] };

export function hatchLocations(packet: Packet) {
  return (packet.fields["Hatch location"] ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hatchKey(index: number, name: "type" | "insulated" | "sealed" | "size") {
  if (index === 0) {
    if (name === "type") return "Hatch type";
    if (name === "insulated") return "Hatch insulated?";
    if (name === "sealed") return "Hatch sealed?";
    return "Hatch size (W x H)";
  }
  const n = index + 1;
  if (name === "type") return `Hatch ${n} type`;
  if (name === "insulated") return `Hatch ${n} insulated?`;
  if (name === "sealed") return `Hatch ${n} sealed?`;
  return `Hatch ${n} size (W x H)`;
}
