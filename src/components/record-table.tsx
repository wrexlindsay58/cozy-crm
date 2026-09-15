import { Link } from "@tanstack/react-router";
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
  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-sm bg-card shadow-card">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-page">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  "px-3 py-2.5 text-[11px] font-bold tracking-wider text-muted uppercase",
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
            <tr key={row.id} className="border-b border-line last:border-0 hover:bg-page/80">
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  className={cn(
                    "px-3 py-3",
                    c.hide === "sm" && "hidden sm:table-cell",
                    c.hide === "md" && "hidden md:table-cell",
                    c.hide === "lg" && "hidden lg:table-cell",
                  )}
                >
                  {i === 0 ? (
                    <Link to={href(row) as never} className="font-semibold text-ink hover:text-navy">
                      {c.render(row)}
                    </Link>
                  ) : (
                    c.render(row)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
