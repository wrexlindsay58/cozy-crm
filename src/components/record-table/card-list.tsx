import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { Col } from "@/components/record-table/types";

export function CardList<T extends { id: string }>({
  rows,
  columns,
  href,
  index,
  action,
  presence,
}: {
  rows: T[];
  columns: Col<T>[];
  href: (row: T) => string;
  index: number;
  action?: (row: T) => ReactNode;
  presence: Record<string, string>;
}) {
  const name = columns[0];
  const statusCol = columns.find((c) => c.key === "status" || c.key === "result");
  const ownerCol = columns.find((c) => c.key === "who" || c.key === "owner");
  const metricCol = columns.find((c) => c.align === "right");
  const reachCol = columns.find((c) => c.key === "reach");
  return (
    <ul className="divide-y divide-line bg-card md:hidden">
      {rows.map((row, rowIndex) => (
        <li
          key={row.id}
          data-row-active={rowIndex === index ? "" : undefined}
          data-editing-user={presence[row.id] || undefined}
          className="flex flex-col gap-1 px-4 py-2 [content-visibility:auto] [contain-intrinsic-size:auto_7.5rem]"
        >
          {name ? (
            <Link to={href(row)} preload="intent" className="type-group flex min-h-11 items-center">
              {name.render(row)}
            </Link>
          ) : null}
          {reachCol ? <div className="flex min-h-11 items-center">{reachCol.render(row)}</div> : null}
          <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1">
            {statusCol ? <div className="inline-flex min-h-11 items-center">{statusCol.render(row)}</div> : null}
            {ownerCol ? <div className="inline-flex min-h-11 items-center">{ownerCol.render(row)}</div> : null}
            {metricCol ? <div className="ml-auto inline-flex min-h-11 items-center font-semibold tabular-nums">{metricCol.render(row)}</div> : null}
            {action ? <div className="inline-flex min-h-11 items-center">{action(row)}</div> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
