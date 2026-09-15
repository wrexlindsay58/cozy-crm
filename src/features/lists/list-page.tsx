import type { ReactNode } from "react";
import { FilterChip, PageTitle } from "@/components/ui-bits";

export function ListPage({
  title,
  count,
  actions,
  views,
  view,
  onView,
  search,
  onSearch,
  searchPlaceholder = "Name, phone, address, id",
  empty,
  children,
}: {
  title: string;
  count?: string;
  actions?: ReactNode;
  views?: string[];
  view?: string;
  onView?: (v: string) => void;
  search?: string;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  empty?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <div className="shrink-0 border-b border-line bg-card px-4 py-3 md:px-5">
        <PageTitle title={title} count={count} actions={actions} flush />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {onSearch ? (
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 min-h-11 w-full rounded-md border border-line bg-page px-3 text-sm outline-none focus:border-navy sm:w-64"
            />
          ) : null}
          {views?.map((v) => (
            <FilterChip key={v} active={view === v} onClick={() => onView?.(v)}>
              {v}
            </FilterChip>
          ))}
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{empty ? <div className="p-4">{empty}</div> : children}</div>
    </main>
  );
}
