import { useState } from "react";

const SEED = [
  { id: "phx", name: "Phoenix", city: "Surprise, AZ", active: true },
  { id: "sct", name: "Scottsdale", city: "Scottsdale, AZ", active: true },
  { id: "dal", name: "Dallas", city: "Dallas, TX", active: true },
  { id: "ftw", name: "Fort Worth", city: "Fort Worth, TX", active: true },
  { id: "nphx", name: "North Phoenix", city: "Phoenix, AZ", active: true },
];

export function OfficesList() {
  const [rows, setRows] = useState(SEED);
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {rows.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <div>
            <p className="font-semibold">{o.name}</p>
            <p className="text-muted">{o.city}</p>
          </div>
          <button
            type="button"
            onClick={() => setRows((cur) => cur.map((r) => (r.id === o.id ? { ...r, active: !r.active } : r)))}
            className="h-10 rounded-md border border-line px-3 text-xs font-semibold"
          >
            {o.active ? "Open" : "Closed"}
          </button>
        </li>
      ))}
    </ul>
  );
}
