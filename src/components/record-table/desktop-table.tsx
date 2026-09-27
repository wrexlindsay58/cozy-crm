import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import type { Sort } from "@/features/lists/sort";
import { hideCls, rowEdge, type Col } from "@/components/record-table/types";

export function DesktopTable<T extends { id: string }>({
  rows,
  columns,
  href,
  sort,
  onSort,
  action,
  index,
  presence,
}: {
  rows: T[];
  columns: Col<T>[];
  href: (row: T) => string;
  sort?: Sort;
  onSort?: (key: string) => void;
  action?: (row: T) => ReactNode;
  index: number;
  presence: Record<string, string>;
}) {
  return (
    <div className="hidden w-full min-w-0 overflow-x-auto md:block">
      <table className="type-body w-full min-w-0 border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((c, i) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : onSort ? "none" : undefined}
                  className={cn(
                    "sticky top-0 z-10 border-b border-line bg-page px-3 py-2.5 text-[11px] font-bold tracking-wider text-muted uppercase",
                    i === 0 && "sticky left-0 z-20",
                    c.align === "right" && "text-right",
                    hideCls(c.hide),
                  )}
                >
                  {onSort ? (
                    <button type="button" onClick={() => onSort(c.key)} className={cn("inline-flex items-center gap-1", c.align === "right" && "ml-auto")}>
                      {c.label}
                      <span aria-hidden="true">{active ? (sort?.dir === "asc" ? "↑" : "↓") : ""}</span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
            {action ? (
              <th className="sticky top-0 z-10 w-36 border-b border-line bg-page">
                <span className="sr-only">Actions</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id} data-row-active={rowIndex === index ? "" : undefined} data-editing-user={presence[row.id] || undefined} className={cn("group", presence[row.id] && "shadow-[inset_3px_0_0_0_#9a3412]")}>
              {columns.map((c, i) => {
                const edge = i === 0 ? "first" : i === columns.length - 1 && !action ? "last" : "mid";
                return (
                  <td
                    key={c.key}
                    className={cn(
                      "min-w-0 border-b border-line bg-card px-3 py-0 group-hover:bg-page",
                      rowIndex === index && "bg-page",
                      rowEdge(rowIndex === index, edge),
                      i === 0 && "sticky left-0 z-[1]",
                      c.align === "right" && "text-right",
                      hideCls(c.hide),
                    )}
                  >
                    {i === 0 && !c.interactive ? (
                      <Link to={href(row)} preload="intent" className={cn("flex min-h-11 min-w-0 items-center", c.align === "right" && "justify-end")}>
                        {c.render(row)}
                      </Link>
                    ) : (
                      <div className={cn("flex min-h-11 min-w-0 items-center", c.align === "right" && "justify-end")}>{c.render(row)}</div>
                    )}
                  </td>
                );
              })}
              {action ? (
                <td className={cn("border-b border-line bg-card px-3 group-hover:bg-page", rowIndex === index && "bg-page", rowEdge(rowIndex === index, "last"))}>
                  <div className="flex min-h-11 items-center justify-end">{action(row)}</div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
