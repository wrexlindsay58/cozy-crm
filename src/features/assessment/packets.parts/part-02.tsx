import { setField } from "../store";
import { fieldCaption, type AssessField } from "../categories";
import { FieldInput } from "../field-input";
import { cn } from "@/lib/cn";
import type { Packet } from "../types";
import { ReturnSizes, HATCH_TYPE, HATCH_INSULATED, HATCH_SEALED, hatchLocations, hatchKey } from "./part-01";

export function hatchFacts(packet: Packet) {
  const locations = hatchLocations(packet);
  const rows: { label: string; value: string }[] = [];
  const push = (label: string, value: string | undefined) => {
    const clean = value?.trim();
    if (clean) rows.push({ label, value: clean });
  };
  if (!locations.length) {
    push("Hatch type", packet.fields["Hatch type"]);
    push("Hatch insulated?", packet.fields["Hatch insulated?"]);
    push("Hatch sealed?", packet.fields["Hatch sealed?"]);
    push("Hatch size (W x H)", packet.fields["Hatch size (W x H)"]);
    return rows;
  }
  locations.forEach((_, index) => {
    const prefix = locations.length > 1 ? `Hatch ${index + 1} ` : "Hatch ";
    push(`${prefix}type`, packet.fields[hatchKey(index, "type")]);
    push(`${prefix}insulated?`, packet.fields[hatchKey(index, "insulated")]);
    push(`${prefix}sealed?`, packet.fields[hatchKey(index, "sealed")]);
    push(locations.length > 1 ? `Hatch ${index + 1} size (W x H)` : "Hatch size (W x H)", packet.fields[hatchKey(index, "size")]);
  });
  return rows;
}

function HatchSets({ assessmentId, packet, readOnly }: { assessmentId: string; packet: Packet; readOnly: boolean }) {
  const locations = hatchLocations(packet);
  if (!locations.length) return null;
  return (
    <>
      {locations.map((location, index) => {
        const many = locations.length > 1;
        const typeLabel = many ? `Hatch ${index + 1} type` : "Hatch type";
        const insulatedLabel = many ? `Hatch ${index + 1} insulated?` : "Hatch insulated?";
        const sealedLabel = many ? `Hatch ${index + 1} sealed?` : "Hatch sealed?";
        const sizeLabel = many ? `Hatch ${index + 1} size (W x H)` : "Hatch size (W x H)";
        return (
          <div key={location} className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
            {many ? <p className="text-[13px] font-semibold text-ink sm:col-span-2">Hatch {index + 1} · {location}</p> : null}
            <HatchField assessmentId={assessmentId} packet={packet} readOnly={readOnly} field={{ ...HATCH_TYPE, id: `hatch-type-${index}`, label: typeLabel }} storageKey={hatchKey(index, "type")} />
            <HatchField assessmentId={assessmentId} packet={packet} readOnly={readOnly} field={{ ...HATCH_INSULATED, id: `hatch-ins-${index}`, label: insulatedLabel }} storageKey={hatchKey(index, "insulated")} />
            <HatchField assessmentId={assessmentId} packet={packet} readOnly={readOnly} field={{ ...HATCH_SEALED, id: `hatch-seal-${index}`, label: sealedLabel }} storageKey={hatchKey(index, "sealed")} />
            <label className="block text-sm">
              <span className="text-[13px] font-semibold text-ink">{sizeLabel}</span>
              {readOnly ? (
                <p className="mt-1 text-sm">{packet.fields[hatchKey(index, "size")] || "—"}</p>
              ) : (
                <input
                  value={packet.fields[hatchKey(index, "size")] ?? ""}
                  onChange={(e) => setField(assessmentId, "attic", hatchKey(index, "size"), e.target.value)}
                  placeholder="30 x 22"
                  className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
                />
              )}
            </label>
          </div>
        );
      })}
    </>
  );
}

function HatchField({
  assessmentId,
  packet,
  field,
  storageKey,
  readOnly,
}: {
  assessmentId: string;
  packet: Packet;
  field: AssessField;
  storageKey: string;
  readOnly: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[13px] font-semibold text-ink">{field.label}</span>
      <FieldInput field={field} value={packet.fields[storageKey] ?? ""} onChange={(v) => setField(assessmentId, "attic", storageKey, v)} readOnly={readOnly} />
    </label>
  );
}

export function PacketCardView(props: { bag: { def: any; packet: any; assessmentId: any; readOnly: any } }) {
  const { def, packet, assessmentId, readOnly } = props.bag;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
            {def.fields.map((field: any) => (
              <label key={field.id} className={cn("block text-sm", field.kind === "multi" && "sm:col-span-2")}>
                <span className="text-[13px] font-semibold text-ink">{fieldCaption(field)}</span>
                <FieldInput
                  field={field}
                  value={packet.fields[field.label] ?? ""}
                  onChange={(v) => setField(assessmentId, def.id, field.label, v)}
                  readOnly={readOnly}
                />
              </label>
            ))}
            {def.id === "ducts" ? <ReturnSizes assessmentId={assessmentId} packet={packet} readOnly={readOnly} /> : null}
            {def.id === "attic" ? <HatchSets assessmentId={assessmentId} packet={packet} readOnly={readOnly} /> : null}
          </div>
  );
}
