import type { LucideIcon } from "lucide-react";
import { List } from "lucide-react";

export function ContactName({ name, second, place }: { name: string; second?: string; place?: string }) {
  const other = second && !name.toLowerCase().includes(second.toLowerCase()) ? second : "";
  return (
    <span className="block min-w-0">
      <span className="block truncate font-semibold">{name}</span>
      {other ? <span className="block truncate text-[12px]">{other}</span> : null}
      {place ? <span className="mt-0.5 block truncate text-[12px] font-normal text-muted">{place}</span> : null}
    </span>
  );
}

export function Reach({ phone, email }: { phone?: string; email?: string }) {
  return (
    <span className="block min-w-0">
      <span className="block truncate">{phone || "No phone"}</span>
      <span className="block truncate text-[12px] text-muted">{email || "No email"}</span>
    </span>
  );
}

export function WhoStack({ name }: { name?: string }) {
  const parts = (name || "").split(" ").filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-[10px] font-semibold text-card">{initials}</span>
      <span className="truncate">{name || "—"}</span>
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

export type CountCard = { id: string; label: string; count: number; tone?: "watch" | "alert"; icon?: LucideIcon };

export function countsFor<T>(rows: T[], cards: { id: string; label: string; tone?: "watch" | "alert"; icon?: LucideIcon; match: (row: T) => boolean }[]): CountCard[] {
  return [{ id: "All", label: "All", count: rows.length, icon: List }, ...cards.map((c) => ({ id: c.id, label: c.label, count: rows.filter(c.match).length, tone: c.tone, icon: c.icon }))];
}
