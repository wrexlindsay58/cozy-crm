export function ContactName({ name, second, place }: { name: string; second?: string; place?: string }) {
  const title = second && !name.toLowerCase().includes(second.toLowerCase()) ? `${name} & ${second}` : name;
  return (
    <span className="block min-w-0">
      <span className="block truncate font-semibold">{title}</span>
      {place ? <span className="mt-0.5 block truncate text-[12px] font-normal text-muted">{place}</span> : null}
    </span>
  );
}

export function QuietFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 shrink-0 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-navy">
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export type CountCard = { id: string; label: string; count: number; tone?: "watch" | "alert" };

export function countsFor<T>(rows: T[], cards: { id: string; label: string; tone?: "watch" | "alert"; match: (row: T) => boolean }[]): CountCard[] {
  return [{ id: "All", label: "All", count: rows.length }, ...cards.map((c) => ({ id: c.id, label: c.label, count: rows.filter(c.match).length, tone: c.tone }))];
}
