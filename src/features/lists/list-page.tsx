import type { ReactNode } from "react";
import { BackLink, FilterChip, PageTitle } from "@/components/ui-bits";
import { cn } from "@/lib/cn";
import type { CountCard } from "./bits";

export function ListPage({
  title,
  count,
  actions,
  views,
  view,
  onView,
  cards,
  filters,
  search,
  onSearch,
  searchPlaceholder = "Name, phone, address",
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
  cards?: CountCard[];
  filters?: ReactNode;
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
              className="h-11 min-h-11 w-full min-w-40 shrink-0 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy sm:w-64"
            />
          ) : null}
          {filters}
          {cards
            ? cards.map((c) => {
                const on = view === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onView?.(c.id)}
                    className={cn("inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md border px-2.5", on ? "border-navy bg-navy text-card" : "border-line bg-card")}
                  >
                    {Icon ? <Icon className="size-3.5" /> : null}
                    <span className={cn("text-sm font-semibold tabular-nums", !on && (c.tone === "alert" ? "text-alert" : c.tone === "watch" ? "text-watch" : "text-navy"))}>{c.count}</span>
                    <span className={cn("text-[13px] font-medium", on ? "text-card" : "text-muted")}>{c.label}</span>
                  </button>
                );
              })
            : null}
          {!cards && views?.length ? (
            <label className="w-full md:hidden">
              <span className="sr-only">View</span>
              <select value={view} onChange={(e) => onView?.(e.target.value)} className="h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
                {views.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {!cards ? (
            <div className="hidden flex-nowrap items-center gap-2 md:flex">
              {views?.map((v) => (
                <FilterChip key={v} active={view === v} onClick={() => onView?.(v)}>
                  {v}
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{empty ? <div className="p-4">{empty}</div> : children}</div>
    </main>
  );
}
