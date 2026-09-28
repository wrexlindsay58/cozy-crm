import { assignedIds, BOOK_STATUSES, familyOf, type BookEvent, type BookFamily, type BookStatus } from "./types";

export function statusOptions(events: BookEvent[], opts: { group: string; family: "all" | BookFamily; resourceIds: string[] }) {
  if (opts.group === "all" && opts.family === "all") return [...BOOK_STATUSES];
  const ids = new Set(opts.resourceIds);
  const have = new Set<BookStatus>();
  for (const e of events) {
    if (opts.family !== "all" && familyOf(e.type) !== opts.family) continue;
    if (opts.group !== "all" && !assignedIds(e).some((id) => ids.has(id))) continue;
    have.add(e.status);
  }
  return BOOK_STATUSES.filter((s) => have.has(s));
}
