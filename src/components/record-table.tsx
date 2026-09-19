import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Col<T> = {
  key: string;
  label: string;
  hide?: "sm" | "md" | "lg";
  render: (row: T) => ReactNode;
};

export function RecordTable<T extends { id: string }>({
  rows,
  columns,
  href,
}: {
  rows: T[];
  columns: Col<T>[];
  href: (row: T) => string;
}) {
  const cardCols = columns.filter((c) => c.hide !== "lg");
  return (
    <>
      <ul className="divide-y divide-line bg-card md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <a href={href(row)} className="flex flex-col gap-1.5 px-4 py-3">
              <span className="text-sm font-semibold text-ink">{columns[0]?.render(row)}</span>
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
                {cardCols.slice(1).map((c) => (
                  <span key={c.key} className="inline-flex min-w-0 items-center">
                    {c.render(row)}
                  </span>
                ))}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <div className="hidden w-full min-w-0 overflow-auto md:block">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    "sticky top-0 z-10 border-b border-line bg-page px-3 py-2.5 text-[11px] font-bold tracking-wider text-muted uppercase",
                    i === 0 && "sticky left-0 z-20",
                    c.hide === "sm" && "hidden sm:table-cell",
                    c.hide === "md" && "hidden md:table-cell",
                    c.hide === "lg" && "hidden lg:table-cell",
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn(
                      "border-b border-line bg-card px-3 py-0 group-hover:bg-page",
                      i === 0 && "sticky left-0 z-[1]",
                      c.hide === "sm" && "hidden sm:table-cell",
                      c.hide === "md" && "hidden md:table-cell",
                      c.hide === "lg" && "hidden lg:table-cell",
                    )}
                  >
                    {i === 0 ? (
                      <a href={href(row)} className="flex min-h-11 items-center font-semibold text-ink hover:text-navy">
                        {c.render(row)}
                      </a>
                    ) : (
                      <div className="flex min-h-11 items-center">{c.render(row)}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
