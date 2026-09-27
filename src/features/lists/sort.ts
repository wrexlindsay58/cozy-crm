export type Sort = { key: string; dir: "asc" | "desc" };

export function sortRows<T>(rows: T[], sort: Sort, value: (row: T, key: string) => string | number) {
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = value(a, sort.key);
    const bv = value(b, sort.key);
    const n = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === "asc" ? n : -n;
  });
  return copy;
}
