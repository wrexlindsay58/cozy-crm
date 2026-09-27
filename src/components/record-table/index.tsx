import { useRef, type ReactNode } from "react";
import { usePresence } from "@/features/realtime/presence";
import type { Sort } from "@/features/lists/sort";
import { CardList } from "@/components/record-table/card-list";
import { DesktopTable } from "@/components/record-table/desktop-table";
import { useRowKeys } from "@/components/record-table/use-row-keys";
import type { Col } from "@/components/record-table/types";

export type { Col };

export function RecordTable<T extends { id: string }>({
  rows,
  columns,
  href,
  sort,
  onSort,
  action,
  empty,
}: {
  rows: T[];
  columns: Col<T>[];
  href: (row: T) => string;
  sort?: Sort;
  onSort?: (key: string) => void;
  action?: (row: T) => ReactNode;
  empty?: ReactNode;
}) {
  const presence = usePresence();
  const box = useRef<HTMLDivElement>(null);
  const index = useRowKeys(rows, href, box);

  if (rows.length === 0) {
    return empty ? <div className="bg-card px-4 py-8">{empty}</div> : null;
  }

  return (
    <div ref={box}>
      <CardList rows={rows} columns={columns} href={href} index={index} action={action} presence={presence} />
      <DesktopTable rows={rows} columns={columns} href={href} sort={sort} onSort={onSort} action={action} index={index} presence={presence} />
    </div>
  );
}
