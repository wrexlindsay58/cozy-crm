export type ListDir = "asc" | "desc";

export type ListQuery<V extends string = string, S extends string = string> = {
  view?: V;
  q?: string;
  owner?: string;
  office?: string;
  sort?: S;
  dir?: ListDir;
};

export type ListSearch<V extends string = string, S extends string = string> = {
  view: V | "All";
  q: string;
  owner: string;
  office: string;
  sort: S | "rank";
  dir: ListDir;
};

export function listSearch<const V extends string, const S extends string>(views: readonly V[], sorts: readonly S[]) {
  const allowedViews = new Set<string>(views);
  const allowedSorts = new Set<string>(sorts);
  return (raw: Record<string, unknown> | ListSearch<V, S>): ListQuery<V, S> => {
    const row = raw as Record<string, unknown>;
    const out: ListQuery<V, S> = {};
    if (typeof row.view === "string" && row.view !== "All" && allowedViews.has(row.view)) out.view = row.view as V;
    if (typeof row.q === "string" && row.q) out.q = row.q;
    if (typeof row.owner === "string" && row.owner) out.owner = row.owner;
    if (typeof row.office === "string" && row.office) out.office = row.office;
    if (typeof row.sort === "string" && row.sort !== "rank" && allowedSorts.has(row.sort)) out.sort = row.sort as S;
    if (row.dir === "desc") out.dir = "desc";
    return out;
  };
}

export function readListSearch<V extends string, S extends string>(raw: ListQuery<V, S> | undefined): ListSearch<V, S> {
  return {
    view: raw?.view ?? "All",
    q: raw?.q ?? "",
    owner: raw?.owner ?? "",
    office: raw?.office ?? "",
    sort: raw?.sort ?? "rank",
    dir: raw?.dir ?? "asc",
  };
}

export function applyListPatch<T extends ListSearch>(prev: T, next: Partial<T>): T {
  return { ...prev, ...next };
}
