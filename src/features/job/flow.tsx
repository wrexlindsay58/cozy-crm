import { useState } from "react";
import { cn } from "@/lib/cn";
import { CHAPTERS, chapterFor, type Chapter, type JobFile } from "./types";
import { SoldChapter } from "./sold-chapter";
import { ReadyChapter } from "./ready-chapter";
import { CrewChapter } from "./crew-chapter";
import { RunChapter } from "./run-chapter";
import { MoneyBlock } from "./money";
import { CloseBlock } from "./close";
import { PrepChapter } from "./prep-chapter";
import { InventoryChapter } from "./inventory-chapter";
import { QualityChapter } from "./quality-chapter";

const LABEL: Record<Chapter, string> = {
  sold: "Acceptance",
  ready: "Materials",
  crew: "Crews",
  prep: "Prep",
  inventory: "Inventory",
  run: "Installation",
  quality: "Quality",
  money: "Money",
  close: "Closeout",
};

export function JobChapter({ job, chap }: { job: JobFile; chap: Chapter }) {
  return (
    <div className="space-y-2">
      {chap === "sold" ? <SoldChapter job={job} /> : null}
      {chap === "ready" ? <ReadyChapter job={job} /> : null}
      {chap === "crew" ? <CrewChapter job={job} /> : null}
      {chap === "prep" ? <PrepChapter job={job} /> : null}
      {chap === "inventory" ? <InventoryChapter job={job} /> : null}
      {chap === "run" ? <RunChapter job={job} /> : null}
      {chap === "quality" ? <QualityChapter job={job} /> : null}
      {chap === "money" ? <MoneyBlock job={job} /> : null}
      {chap === "close" ? <CloseBlock job={job} /> : null}
    </div>
  );
}

export function JobFlow({ job }: { job: JobFile }) {
  const [chap, setChap] = useState<Chapter>(chapterFor(job.stage));
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
      <div className="pt-2">
        <JobChapter job={job} chap={chap} />
      </div>
    </div>
  );
}
