import { useState } from "react";
import { cn } from "@/lib/cn";
import { CallLog } from "@/features/lead/call-log";
import { HistoryList, PhotoRail, TicketRail } from "./side-rails";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import type { RecordShellProps } from "./types";

export function RecordShell(props: RecordShellProps) {
  const [drawer, setDrawer] = useState(false);
  const [lane, setLane] = useState<"customer" | "internal">("customer");
  const [callOpen, setCallOpen] = useState(false);

  function openThread() {
    setLane("customer");
    const wide = window.matchMedia("(min-width: 1280px)").matches;
    if (!wide) setDrawer(true);
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  const acts = props.acts.map((a) =>
    a.label === "Call" && !a.onClick ? { ...a, onClick: () => setCallOpen((v) => !v) } : a,
  );

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
      <PeopleRow personId={props.personId} owner={props.owner} seedFollowers={props.followers} />

      <div className="relative flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto p-4 md:p-5">
          <div className="space-y-3">
            <CallLog personId={props.personId} open={callOpen} onClose={() => setCallOpen(false)} />
            {props.children}
          </div>
          <HistoryList history={props.history} />
        </div>

        <aside className="hidden w-[360px] shrink-0 flex-col border-l border-line bg-card min-[1280px]:flex">
          <SideHead lane={lane} onLane={setLane} />
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="h-[320px]">
              <ThreadPane personId={props.personId} mode={lane} />
            </div>
            <TicketRail tickets={props.tickets} />
            <PhotoRail photos={props.photos} />
          </div>
        </aside>

        <button
          type="button"
          className="fixed right-3 bottom-3 z-20 h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card min-[1280px]:hidden"
          onClick={() => setDrawer(true)}
        >
          Thread
        </button>
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 min-[1280px]:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close thread" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-[min(100%,360px)] flex-col bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <SideHead lane={lane} onLane={setLane} />
              <button type="button" className="h-10 text-sm font-semibold text-muted" onClick={() => setDrawer(false)}>
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="h-[45%]">
                <ThreadPane personId={props.personId} mode={lane} />
              </div>
              <TicketRail tickets={props.tickets} />
              <PhotoRail photos={props.photos} />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function SideHead({
  lane,
  onLane,
}: {
  lane: "customer" | "internal";
  onLane: (v: "customer" | "internal") => void;
}) {
  return (
    <div className="flex gap-1 px-3 py-2">
      <button type="button" onClick={() => onLane("customer")} className={cn("h-10 rounded-md px-2 text-xs font-semibold", lane === "customer" ? "bg-navy text-card" : "text-muted")}>
        Customer
      </button>
      <button type="button" onClick={() => onLane("internal")} className={cn("h-10 rounded-md px-2 text-xs font-semibold", lane === "internal" ? "bg-navy text-card" : "text-muted")}>
        Internal
      </button>
    </div>
  );
}
