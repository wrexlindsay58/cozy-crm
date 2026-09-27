import { money } from "@/lib/crm-data";

export function Stars({ n, tone }: { n: number; tone?: "gold" | "silver" | "bronze" }) {
  const fill =
    tone === "gold" || n >= 5
      ? "#C4A35A"
      : tone === "silver" || n === 4
        ? "#8AA0AB"
        : tone === "bronze" || n === 3
          ? "#A67C52"
          : n <= 1
            ? "var(--color-stop)"
            : "var(--color-navy)";
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-3.5 shrink-0" aria-hidden>
          <path d="M12 2.6 14.7 8.4l6.4.9-4.6 4.5 1.1 6.4L12 17.2 6.4 20.2l1.1-6.4L2.9 9.3l6.4-.9L12 2.6z" fill={i <= n ? fill : "var(--color-page)"} />
        </svg>
      ))}
    </span>
  );
}

export function initials(name: string) {
  const parts = name.replace(/—/g, " ").split(/\s+/).filter(Boolean);
  if (/^crew/i.test(name)) return ((parts[1]?.[0] ?? "C") + (parts[2]?.[0] ?? parts[1]?.[1] ?? "")).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function RankList({ rows }: { rows: { id: string; name: string; role: string; amount: number; why: string }[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {rows.length ? (
        rows.map((p) => (
          <li key={p.id} className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-[11px] font-bold tracking-wide text-card">{initials(p.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{p.name}</span>
              <span className="text-[12px] text-muted">
                {p.role} · {p.why}
              </span>
            </span>
            <span className="shrink-0 text-[15px] font-bold tabular-nums">{p.role === "Closer" ? money(p.amount) : p.amount}</span>
          </li>
        ))
      ) : (
        <li className="text-[13px] text-muted">None yet</li>
      )}
    </ul>
  );
}
