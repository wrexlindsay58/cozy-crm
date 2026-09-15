import { useState } from "react";
import { addTerritory, useStaff } from "@/features/staff/store";

export function TerritoriesList() {
  const { territories } = useStaff();
  const [name, setName] = useState("");
  const [zips, setZips] = useState("");
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line rounded-md border border-line bg-card">
        {territories.map((t) => (
          <li key={t.id} className="px-4 py-3 text-sm">
            <p className="font-semibold">{t.name}</p>
            <p className="text-muted">{t.zips}</p>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] rounded-md border border-line bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          addTerritory(name, zips);
          setName("");
          setZips("");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Territory" className="h-11 rounded-md border border-line px-3 text-sm" />
        <input value={zips} onChange={(e) => setZips(e.target.value)} placeholder="ZIPs" className="h-11 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
          Add
        </button>
      </form>
    </div>
  );
}
