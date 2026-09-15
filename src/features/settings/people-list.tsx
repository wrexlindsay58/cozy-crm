import { OFFICES, ROLES, patchPerson, useStaff } from "@/features/staff/store";

export function PeopleList() {
  const { people } = useStaff();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {people.map((p) => (
        <li key={p.name} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_8rem_8rem_auto]">
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
