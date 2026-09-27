import { ChevronDown } from "lucide-react";
import { setProperty } from "../store";
import type { Assessment } from "../types";
import { Fact, FactGrid } from "@/features/record-shell/file-sheet";
import { useAdminSettings } from "@/features/admin-settings/store";
import { PropertyCardView2 } from "./part-02";

export const inputClass = "mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export const selectClass = `${inputClass} appearance-none pr-10`;

export function PropertyCard({ file, readOnly = false }: { file: Assessment; readOnly?: boolean }) {
  const p = file.property;
  const { utilities } = useAdminSettings();
  function set(key: keyof typeof p, value: string) {
    if (readOnly) return;
    setProperty(file.id, { [key]: value });
  }
  if (readOnly) {
    const facts: [string, string][] = [
      ["Year built", p.yearBuilt],
      ["Sq ft", p.sqft],
      ["Stories", p.stories],
      ["Occupancy", p.occupancy],
      ["HOA", p.hoa],
      ["Utility", p.utility],
      ["Both home", p.bothHome],
      ["People", p.occupants],
      ["Peak summer bill", p.peakBill],
      ["Indoor °F", p.indoorTemp],
      ["Outdoor °F", p.outdoorTemp],
      ["Hot rooms", p.hotRooms],
      ["Cold rooms", p.coldRooms],
      ["Access", p.access],
      ["Electrical", p.electrical],
      ["Notes", p.notes],
    ];
    return (
      <section className="rounded-md border border-line bg-card">
        <header className="border-b border-line px-5 py-4">
          <h2 className="type-section">House</h2>
          <p className="mt-1 text-[13px] text-muted">What was measured on the property.</p>
        </header>
        <div className="px-5 py-5">
          <FactGrid>
            {facts
              .filter(([, v]) => v)
              .map(([label, value]) => (
                <Fact key={label} label={label} value={value} wide={label === "Notes" || label === "Access"} />
              ))}
          </FactGrid>
        </div>
      </section>
    );
  }
  return (
    <PropertyCardView2 bag={{ p, set, utilities }} />
  );
}

export function PropertyCardView(props: { bag: { p: any; set: any; utilities: any } }) {
  const { p, set, utilities } = props.bag;
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="relative block text-sm">
          <span className="text-[13px] font-semibold text-ink">Utility</span>
          <select value={p.utility} onChange={(e) => set("utility", e.target.value)} className={selectClass}>
            <option value="">—</option>
            {utilities.map((u: any) => (
              <option key={u.id}>{u.name}</option>
            ))}
            <option>SRP</option>
            <option>Other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
        <label className="relative block text-sm">
          <span className="text-[13px] font-semibold text-ink">Both home</span>
          <select value={p.bothHome} onChange={(e) => set("bothHome", e.target.value)} className={selectClass}>
            <option value="">—</option>
            <option>Yes</option>
            <option>No</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
      </div>
  );
}
