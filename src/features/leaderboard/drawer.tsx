import { useEffect } from "react";
import type { Metric } from "@/features/leaderboard/catalog";
import { workFor } from "@/features/leaderboard/work";
import type { Ranked } from "@/features/leaderboard/rank";
import { money } from "@/lib/crm-data";
import type { RangeId } from "@/lib/sales-data";

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function scoreText(kind: Metric["kind"], score: number, sample: string) {
  if (sample === "minute") return score < 60 ? `${score} min` : `${Math.max(1, Math.round(score / 60))} hr`;
  if (kind === "money") return money(score);
  if (kind === "pct") return `${Math.round(score)}%`;
  if (kind === "days") return plural(score, "day");
  return String(score);
}

export function RankDrawer({
  row,
  metric,
  range,
  members,
  onClose,
}: {
  row: Ranked;
  metric: Metric;
  range: RangeId;
  members?: { name: string; score: number; n: number }[];
  onClose: () => void;
}) {
  const built = members ? null : workFor(row.name, metric, range, row.score, row.n);
  const lines = members
    ? members.map((m) => ({ id: m.name, title: m.name, detail: plural(m.n, metric.sample), figure: scoreText(metric.kind, m.score, metric.sample), href: undefined as string | undefined }))
    : built!.lines;
  const more = built?.more ?? "";
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-semibold">{row.name}</h2>
              <p className="text-[13px] text-muted">{metric.label}</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
          <p className="mt-2 text-[15px] font-semibold text-navy tabular-nums">
            {scoreText(metric.kind, row.score, metric.sample)}
            <span className="font-normal text-muted"> · {plural(row.n, metric.sample)}</span>
          </p>
        </header>
        {lines.length === 0 ? (
          <p className="px-4 py-8 text-[13px] text-muted">Nothing in this period.</p>
        ) : (
          <ol className="min-h-0 flex-1 divide-y divide-line overflow-auto">
            {lines.map((line) => (
              <li key={line.id}>
                {line.href ? (
                  <a href={line.href} className="flex items-center gap-3 px-4 py-3 hover:bg-page">
                    <LineBody title={line.title} detail={line.detail} figure={line.figure} />
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <LineBody title={line.title} detail={line.detail} figure={line.figure} />
                  </div>
                )}
              </li>
            ))}
            {more ? <li className="px-4 py-3 text-[12px] text-muted">{more}</li> : null}
          </ol>
        )}
      </aside>
    </div>
  );
}

function LineBody({ title, detail, figure }: { title: string; detail: string; figure: string }) {
  const alert = figure === "No deal" || figure === "No-show" || figure === "On hold" || figure === "Failed" || figure === "Callback";
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{title}</span>
        <span className="block truncate text-[12px] text-muted">{detail}</span>
      </span>
      <span className={`shrink-0 text-[13px] font-semibold tabular-nums ${alert ? "text-alert" : "text-navy"}`}>{figure}</span>
    </>
  );
}
