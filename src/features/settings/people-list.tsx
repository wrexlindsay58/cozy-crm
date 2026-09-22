import { OFFICES, PAY_KINDS, ROLES, patchPerson, useStaff } from "@/features/staff/store";

export function PeopleList() {
  const { people } = useStaff();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {people.map((p) => (
        <li key={p.name} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_7rem_8rem_7rem_5.5rem_auto]">
          <div>
            <p className="font-semibold">{p.name}</p>
            <p className="text-muted">{p.sold} sold</p>
          </div>
          <select
            value={p.role}
            onChange={(e) => patchPerson(p.name, { role: e.target.value })}
            className="h-11 rounded-md border border-line px-2"
          >
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={p.office}
            onChange={(e) => patchPerson(p.name, { office: e.target.value })}
            className="h-11 rounded-md border border-line px-2"
          >
            {OFFICES.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <select
            value={p.payKind}
            onChange={(e) => patchPerson(p.name, { payKind: e.target.value as typeof p.payKind })}
            className="h-11 rounded-md border border-line px-2"
          >
            {PAY_KINDS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
          <label className="relative">
            <input
              value={p.rate || ""}
              inputMode="decimal"
              onChange={(e) => patchPerson(p.name, { rate: Number(e.target.value) || 0 })}
              className="h-11 w-full rounded-md border border-line px-2 pr-8 text-sm tabular-nums"
            />
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted">{p.payKind === "Hourly" ? "/hr" : "/day"}</span>
          </label>
          <button
            type="button"
            onClick={() => patchPerson(p.name, { active: !p.active })}
            className="h-11 rounded-md border border-line px-3 text-xs font-semibold"
          >
            {p.active ? "Active" : "Off book"}
          </button>
        </li>
      ))}
    </ul>
  );
}
