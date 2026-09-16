import { useState } from "react";
import { cn } from "@/lib/cn";
import { CHAPTERS, chapterFor, type Chapter, type JobFile } from "./types";
import { SoldChapter } from "./sold-chapter";
import { ReadyChapter } from "./ready-chapter";
import { CrewChapter } from "./crew-chapter";
import { RunChapter } from "./run-chapter";
import { MoneyBlock } from "./money";
import { CloseBlock } from "./close";
import { money } from "@/lib/crm-data";
import { tally } from "./store";

const LABEL: Record<Chapter, string> = {
  sold: "Sold",
  ready: "Ready",
  crew: "Crew",
  run: "Run",
  money: "Money",
  close: "Close",
};

export function JobFlow({ job }: { job: JobFile }) {
  const [chap, setChap] = useState<Chapter>(chapterFor(job.stage));
  const t = tally(job);
  const summary: Record<Chapter, string> = {
    sold: `${job.scope.filter((s) => s.kind === "product").length} products · ${job.scope.filter((s) => s.kind === "adder").length} adders · ${job.scope.filter((s) => s.kind === "promise").length} promises`,
    ready: job.preCheck.signedAt ? "Pre-install signed" : "Pre-install open",
    crew: `${job.assignments.length} crews · ${job.events.length} days`,
    run: job.punches.length ? `${job.punches.length} clocks` : "No punches",
    money: `${money(t.collect)} to collect`,
    close: job.stage === "Closed" ? "Closed" : "Not closed",
  };

  return (
    <div>
      <nav className="flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:thin]">
        {CHAPTERS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChap(c)}
            className={cn(
              "h-11 shrink-0 px-3 text-sm font-semibold",
              chap === c ? "border-b-2 border-navy text-navy" : "text-muted",
            )}
          >
            {LABEL[c]}
          </button>
        ))}
      </nav>
      <p className="px-1 py-2 text-[12px] text-muted">{summary[chap]}</p>
      {chap === "sold" ? <SoldChapter job={job} /> : null}
      {chap === "ready" ? <ReadyChapter job={job} /> : null}
      {chap === "crew" ? <CrewChapter job={job} /> : null}
      {chap === "run" ? <RunChapter job={job} /> : null}
      {chap === "money" ? <MoneyBlock job={job} /> : null}
      {chap === "close" ? <CloseBlock job={job} /> : null}
    </div>
  );
}
