import { useEffect, useState } from "react";
import { Clock, MessageSquare, StickyNote, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { ClickToCall } from "@/features/lead/click-to-call";
import { useOps } from "@/features/ops/store";
import { PhotoRail, HistoryList } from "./side-rails";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import { WorkTab } from "./work-tab";
import type { RecordShellProps } from "./types";

export type ConvLane = "customer" | "internal" | "notes" | "tickets" | "history";

export function RecordShell(props: RecordShellProps & { openWork?: number }) {
  const [lane, setLane] = useState<ConvLane>("customer");
  const [callOpen, setCallOpen] = useState(false);
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === props.personId);

  useEffect(() => {
    if (props.openWork) setLane("tickets");
  }, [props.openWork]);

  function openThread() {
    setLane("customer");
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  function startCall() {
    if (lead?.dnc) return;
    setLane("customer");
    setCallOpen(true);
  }

  const acts = props.acts
    .filter((a) => a.label !== "Drop")
    .map((a) => {
      if (a.label === "Call" && !a.onClick) return { ...a, onClick: startCall };
      return a;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TitleRow
        kind={props.kind}
        title={props.title}
        subtitle={props.subtitle}
        stage={lead?.dnc ? `${props.stage} · DNC` : props.stage}
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
            {props.children}
            <PhotoRail personId={props.personId} photos={props.photos} />
          </div>
        </div>

        <aside className="flex h-[55vh] min-h-0 min-w-0 shrink-0 flex-col border-t border-line bg-card lg:h-auto lg:flex-[2] lg:border-t-0 lg:border-l">
          <SideHead lane={lane} onLane={setLane} />
          <div className="min-h-0 flex-1 overflow-hidden">
            {callOpen && lead?.phone ? (
              <div className="p-2">
                <ClickToCall personId={props.personId} phone={lead.phone} name={props.title} open={callOpen} onClose={() => setCallOpen(false)} />
              </div>
            ) : null}
            {lane === "tickets" ? (
              <WorkTab personId={props.personId} owner={props.owner.name} />
            ) : lane === "history" ? (
              <div className="h-full overflow-auto p-3">
                <HistoryList history={props.history} flush />
              </div>
            ) : (
              <ThreadPane personId={props.personId} mode={lane} onCall={startCall} dnc={lead?.dnc} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const LANES: { id: ConvLane; label: string; icon: typeof MessageSquare }[] = [
  { id: "customer", label: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", icon: Users },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "history", label: "History", icon: Clock },
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
      {LANES.map((l) => {
        const Icon = l.icon;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onLane(l.id)}
            aria-label={l.label}
            title={l.label}
            className={cn("flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold", lane === l.id ? "bg-navy text-card" : "text-muted")}
          >
            <Icon className="size-4" />
            <span className="hidden md:inline">{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
