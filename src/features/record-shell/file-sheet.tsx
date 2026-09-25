import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FileBlock({ title, hint, aside, children }: { title: string; hint?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-card">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <h2 className="type-section">{title}</h2>
          {hint ? <p className="type-meta mt-1">{hint}</p> : null}
        </div>
        {aside}
      </header>
      <div className="space-y-4 px-4 py-3">{children}</div>
    </section>
  );
}

export function SheetGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-3 first:border-t-0 first:pt-0">
      <h3 className="type-group mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function FactGrid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>;
}

export function Bits({ items }: { items: { label: string; value?: string | number | null }[] }) {
  const rows = items.filter((item) => item.value !== undefined && item.value !== null && String(item.value) !== "");
  if (!rows.length) return null;
  return (
    <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-3">
      {rows.map((item, i) => (
        <div key={`${item.label}-${i}`} className="min-w-0">
          <dt className="type-label">{item.label}</dt>
          <dd className="type-value mt-0.5">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Ledger({ columns, rows }: { columns: string[]; rows: { id: string; cells: (string | undefined | null)[] }[] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className="type-label px-3 pb-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column, i) => (
                <td key={column} className={cn("border-t border-line px-3 py-3.5 align-top", i === 0 ? "type-value" : "type-body")}>
                  {row.cells[i] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Fact({ label, value, wide }: { label: string; value?: string | number | boolean | null; wide?: boolean }) {
  if (value === undefined || value === null || value === "" || value === false) return null;
  const text = typeof value === "boolean" ? "Yes" : String(value);
  return (
    <div className={cn("min-w-0", wide && "sm:col-span-2")}>
      <dt className="type-label">{label}</dt>
      <dd className="type-value mt-1">{text}</dd>
    </div>
  );
}
