import type { ReactNode } from "react";
import { BackLink, FilterChip, PageTitle } from "@/components/ui-bits";

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
  back,
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
  back?: { to: string; label: string };
  children: ReactNode;
}) {
  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <div className="shrink-0 border-b border-line bg-card px-4 py-3 md:px-5">
        {back ? <BackLink to={back.to} label={back.label} /> : null}
        <PageTitle title={title} count={count} actions={actions} flush />
        <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-x-auto">
          {onSearch ? (
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 min-h-11 w-full min-w-40 shrink-0 rounded-md border border-line bg-page px-3 text-sm outline-none focus:border-navy sm:w-64"
            />
          ) : null}
          {views?.length ? (
            <label className="w-full md:hidden">
              <span className="sr-only">View</span>
              <select
                value={view}
                onChange={(e) => onView?.(e.target.value)}
                className="h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
              >
                {views.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="hidden flex-nowrap items-center gap-2 md:flex">
            {views?.map((v) => (
              <FilterChip key={v} active={view === v} onClick={() => onView?.(v)}>
                {v}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{empty ? <div className="p-4">{empty}</div> : children}</div>
    </main>
  );
}
