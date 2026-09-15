import { useState } from "react";
import { cn } from "@/lib/cn";
import { CallLog } from "@/features/lead/call-log";
import { PhotoRail, HistoryList } from "./side-rails";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import { WorkTab } from "./work-tab";
import type { RecordShellProps } from "./types";

export type ConvLane = "customer" | "internal" | "notes" | "tickets" | "history";

export function RecordShell(props: RecordShellProps) {
  const [lane, setLane] = useState<ConvLane>("customer");
  const [callOpen, setCallOpen] = useState(false);

  function openThread() {
    setLane("customer");
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  const acts = props.acts
    .filter((a) => a.label !== "Drop")
    .map((a) => (a.label === "Call" && !a.onClick ? { ...a, onClick: () => setCallOpen((v) => !v) } : a));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TitleRow
        kind={props.kind}
        title={props.title}
        subtitle={props.subtitle}
        stage={props.stage}
        moneyLabel={props.moneyLabel}
        related={props.related}
        acts={acts}
        onText={openThread}
      />
      <PeopleRow
        personId={props.personId}
        owner={props.owner}
        seedFollowers={props.followers}
        canDrop={props.kind === "lead"}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-[3] overflow-auto p-4 md:p-5">
          <div className="space-y-3">
            <CallLog personId={props.personId} open={callOpen} onClose={() => setCallOpen(false)} />
            {props.children}
            <PhotoRail personId={props.personId} photos={props.photos} />
          </div>
        </div>

        <aside className="flex h-[55vh] min-h-0 min-w-0 shrink-0 flex-col border-t border-line bg-card lg:h-auto lg:flex-[2] lg:border-t-0 lg:border-l">
          <SideHead lane={lane} onLane={setLane} />
          <div className="min-h-0 flex-1 overflow-hidden">
            {lane === "tickets" ? (
              <WorkTab personId={props.personId} owner={props.owner.name} />
            ) : lane === "history" ? (
              <div className="h-full overflow-auto p-3">
                <HistoryList history={props.history} flush />
              </div>
            ) : (
              <ThreadPane personId={props.personId} mode={lane} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const LANES: { id: ConvLane; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "internal", label: "Internal" },
  { id: "notes", label: "Notes" },
  { id: "tickets", label: "Tickets" },
  { id: "history", label: "History" },
];

function SideHead({
  lane,
  onLane,
}: {
  lane: ConvLane;
  onLane: (v: ConvLane) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line px-2 py-2">
      {LANES.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onLane(l.id)}
          className={cn("h-10 shrink-0 rounded-md px-3 text-xs font-semibold", lane === l.id ? "bg-navy text-card" : "text-muted")}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
