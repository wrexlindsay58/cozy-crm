import { useState } from "react";
import { cn } from "@/lib/cn";
import { CallLog } from "@/features/lead/call-log";
import { PhotoRail, TicketRail } from "./side-rails";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import type { RecordShellProps } from "./types";

export function RecordShell(props: RecordShellProps) {
  const [lane, setLane] = useState<"customer" | "internal">("customer");
  const [callOpen, setCallOpen] = useState(false);

  function openThread() {
    setLane("customer");
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

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-auto p-4 md:p-5">
          <div className="space-y-3">
            <CallLog personId={props.personId} open={callOpen} onClose={() => setCallOpen(false)} />
            {props.children}
          </div>
        </div>

        <aside className="flex h-[46vh] shrink-0 flex-col border-t border-line bg-card lg:h-auto lg:w-[380px] lg:border-t-0 lg:border-l">
          <SideHead lane={lane} onLane={setLane} />
          <div className="min-h-0 flex-1 overflow-hidden">
            <ThreadPane personId={props.personId} mode={lane} />
          </div>
          <div className="max-h-[38%] shrink-0 overflow-auto border-t border-line">
            <TicketRail tickets={props.tickets} />
            <PhotoRail photos={props.photos} />
          </div>
        </aside>
      </div>
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
