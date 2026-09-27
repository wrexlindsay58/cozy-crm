import { cn } from "@/lib/cn";
import type { PaperRow } from "../model";
import { figureHot } from "./part-01";

export function Figure({ row }: { row: PaperRow }) {
  if (!row.figure) return <span className="w-24 shrink-0" />;
  return <span className={cn("w-24 shrink-0 text-right text-sm font-semibold tabular-nums", figureHot(row.figure) && "text-alert")}>{row.figure}</span>;
}
