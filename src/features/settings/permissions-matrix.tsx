import { ROLES, setPerm, setViewAs, useStaff, type PermKey } from "@/features/staff/store";

const KEYS: { key: PermKey; label: string }[] = [
  { key: "seeCost", label: "See cost" },
  { key: "takeCard", label: "Take card" },
  { key: "editCatalog", label: "Edit catalog" },
  { key: "overrideFee", label: "Override fee" },
];

export function PermissionsMatrix() {
  const { perms, viewAs } = useStaff();
  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">View job as</h2>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setViewAs(r)}
              className={viewAs === r ? "h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" : "h-10 rounded-md border border-line px-3 text-sm font-semibold"}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">Crew / Setter hide costing on the job file.</p>
      </section>
      <div className="overflow-x-auto rounded-md border border-line bg-card">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="text-[11px] font-bold tracking-wide text-muted uppercase">
              <th className="px-3 py-2">Role</th>
              {KEYS.map((k) => (
                <th key={k.key} className="px-3 py-2">{k.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role} className="border-t border-line">
                <td className="px-3 py-2 font-semibold">{role}</td>
                {KEYS.map((k) => (
                  <td key={k.key} className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => setPerm(role, k.key, !perms[role][k.key])}
                      className="h-9 rounded-md border border-line px-2 text-xs font-semibold"
                    >
                      {perms[role][k.key] ? "On" : "Off"}
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
