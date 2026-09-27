import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Sort } from "@/features/lists/sort";

export type Col<T> = {
  key: string;
  label: string;
  hide?: "sm" | "md" | "lg";
  align?: "right";
  interactive?: boolean;
  render: (row: T) => ReactNode;
};

export function RecordTable<T extends { id: string }>({
  rows,
  columns,
  href,
  sort,
  onSort,
  action,
}: {
  rows: T[];
  columns: Col<T>[];
  href: (row: T) => string;
  sort?: Sort;
  onSort?: (key: string) => void;
  action?: (row: T) => ReactNode;
}) {
  const cardCols = columns.filter((c) => c.hide !== "lg");
  return (
    <>
      <ul className="divide-y divide-line bg-card md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-1.5 px-4 py-3">
            <a href={href(row)} className="type-group">
              {columns[0]?.render(row)}
            </a>
            <span className="type-meta flex flex-wrap items-center gap-x-3 gap-y-2">
              {cardCols.slice(1).map((c) => (
                <span key={c.key} className="inline-flex min-w-0 items-center">
                  {c.render(row)}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <div className="hidden w-full min-w-0 overflow-auto md:block">
        <table className="type-body w-full min-w-[1080px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    "sticky top-0 z-10 border-b border-line bg-page px-3 py-2.5 text-[11px] font-bold tracking-wider text-muted uppercase",
                    i === 0 && "sticky left-0 z-20",
                    c.align === "right" && "text-right",
                    c.hide === "sm" && "hidden sm:table-cell",
                    c.hide === "md" && "hidden md:table-cell",
                    c.hide === "lg" && "hidden lg:table-cell",
                  )}
                >
                  {onSort ? (
                    <button type="button" onClick={() => onSort(c.key)} className={cn("inline-flex items-center gap-1", c.align === "right" && "ml-auto")}>
                      {c.label}
                      {sort?.key === c.key ? <span>{sort.dir === "asc" ? "↑" : "↓"}</span> : null}
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
              {action ? <th className="sticky top-0 z-10 w-36 border-b border-line bg-page" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn(
                      "relative border-b border-line bg-card px-3 py-0 group-hover:bg-page",
                      i === 0 && "sticky left-0 z-[1]",
                      c.align === "right" && "text-right",
                      c.hide === "sm" && "hidden sm:table-cell",
                      c.hide === "md" && "hidden md:table-cell",
                      c.hide === "lg" && "hidden lg:table-cell",
                    )}
                  >
                    <a href={href(row)} className={cn("absolute inset-0", c.interactive && "hidden")} aria-label={i === 0 ? "Open" : undefined} tabIndex={i === 0 ? 0 : -1} />
                    <div className={cn("relative flex min-h-11 items-center", !c.interactive && "pointer-events-none", c.align === "right" && "justify-end")}>{c.render(row)}</div>
                  </td>
                ))}
                {action ? (
                  <td className="relative border-b border-line bg-card px-3 group-hover:bg-page">
                    <div className="relative z-10 flex min-h-11 items-center justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100">{action(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
