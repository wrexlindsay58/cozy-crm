import { ChevronDown } from "lucide-react";
import { inputClass, selectClass, PropertyCardView } from "./part-01";

export function PropertyCardView2(props: { bag: { p: any; set: any; utilities: any } }) {
  const { p, set, utilities } = props.bag;
  return (
    <section className="rounded-md border border-line bg-card px-5 py-5">
      <h2 className="type-section mb-5">House</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Year built</span>
          <input value={p.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Sq ft</span>
          <input value={p.sqft} onChange={(e) => set("sqft", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
        <label className="relative block text-sm">
          <span className="text-[13px] font-semibold text-ink">Stories</span>
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
          <span className="text-[13px] font-semibold text-ink">Occupancy</span>
          <select value={p.occupancy} onChange={(e) => set("occupancy", e.target.value)} className={selectClass}>
            <option>Owner</option>
            <option>Renter</option>
            <option>Vacant</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 bottom-3.5 size-4 text-muted" />
        </label>
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">HOA</span>
          <input value={p.hoa} onChange={(e) => set("hoa", e.target.value)} placeholder="None, or the name" className={inputClass} />
        </label>
      </div>
      <PropertyCardView bag={{ p, set, utilities }} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">People in the house</span>
          <input value={p.occupants} onChange={(e) => set("occupants", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Peak summer bill</span>
          <input value={p.peakBill} onChange={(e) => set("peakBill", e.target.value)} inputMode="decimal" placeholder="July or August" className={inputClass} />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-[13px] font-semibold text-ink">Access</span>
        <input value={p.access} onChange={(e) => set("access", e.target.value)} placeholder="Gate, dogs, hatch location" className={inputClass} />
      </label>
      <label className="mt-3 block text-sm">
        <span className="text-[13px] font-semibold text-ink">Electrical</span>
        <input value={p.electrical} onChange={(e) => set("electrical", e.target.value)} placeholder="Panel size and where it sits" className={inputClass} />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Indoor °F at sit</span>
          <input value={p.indoorTemp} onChange={(e) => set("indoorTemp", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Outdoor °F at sit</span>
          <input value={p.outdoorTemp} onChange={(e) => set("outdoorTemp", e.target.value)} inputMode="numeric" className={inputClass} />
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Hot rooms</span>
          <input value={p.hotRooms} onChange={(e) => set("hotRooms", e.target.value)} placeholder="Room names" className={inputClass} />
        </label>
        <label className="block text-sm">
          <span className="text-[13px] font-semibold text-ink">Cold rooms</span>
          <input value={p.coldRooms} onChange={(e) => set("coldRooms", e.target.value)} placeholder="Room names" className={inputClass} />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        <span className="text-[13px] font-semibold text-ink">Property notes</span>
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
