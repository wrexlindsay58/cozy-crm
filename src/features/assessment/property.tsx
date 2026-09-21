import { ChevronDown } from "lucide-react";
import { setProperty } from "./store";
import type { Assessment } from "./types";
import { useAdminSettings } from "@/features/admin-settings/store";

const inputClass = "mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";
const selectClass = `${inputClass} appearance-none pr-10`;

export function PropertyCard({ file }: { file: Assessment }) {
  const p = file.property;
  const { utilities } = useAdminSettings();
  function set(key: keyof typeof p, value: string) {
    setProperty(file.id, { [key]: value });
  }
  return (
    <section className="rounded-md border border-line bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-wide text-muted uppercase">House facts</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Year built</span>
          <input value={p.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Sq ft</span>
          <input value={p.sqft} onChange={(e) => set("sqft", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
        <label className="relative block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Stories</span>
          <select value={p.stories} onChange={(e) => set("stories", e.target.value)} className={selectClass}>
            <option value="">—</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="relative block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Occupancy</span>
          <select value={p.occupancy} onChange={(e) => set("occupancy", e.target.value)} className={selectClass}>
            <option>Owner</option>
            <option>Renter</option>
            <option>Vacant</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">HOA</span>
          <input value={p.hoa} onChange={(e) => set("hoa", e.target.value)} placeholder="None, or the name" className={inputClass} />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="relative block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Utility</span>
          <select value={p.utility} onChange={(e) => set("utility", e.target.value)} className={selectClass}>
            <option value="">—</option>
            {utilities.map((u) => (
              <option key={u.id}>{u.name}</option>
            ))}
            <option>SRP</option>
            <option>Other</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
        <label className="relative block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Both home</span>
          <select value={p.bothHome} onChange={(e) => set("bothHome", e.target.value)} className={selectClass}>
            <option value="">—</option>
            <option>Yes</option>
            <option>No</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Access</span>
        <input value={p.access} onChange={(e) => set("access", e.target.value)} placeholder="Gate, dogs, hatch location" className={inputClass} />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Electrical</span>
        <input value={p.electrical} onChange={(e) => set("electrical", e.target.value)} placeholder="Panel size and where it sits" className={inputClass} />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Indoor °F at sit</span>
          <input value={p.indoorTemp} onChange={(e) => set("indoorTemp", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Outdoor °F at sit</span>
          <input value={p.outdoorTemp} onChange={(e) => set("outdoorTemp", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Hot rooms (walked)</span>
          <input value={p.hotRooms} onChange={(e) => set("hotRooms", e.target.value)} placeholder="Room names" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Cold rooms (walked)</span>
          <input value={p.coldRooms} onChange={(e) => set("coldRooms", e.target.value)} placeholder="Room names" className={inputClass} />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Property notes</span>
        <textarea
          value={p.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="What the house is telling us."
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>
    </section>
  );
}