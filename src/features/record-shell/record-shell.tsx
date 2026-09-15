import { useState } from "react";
import { Clock, ClipboardList, MessageSquare, StickyNote, Ticket, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";
import { ClickToCall } from "@/features/lead/click-to-call";
import { LeadTools } from "@/features/lead/lead-tools";
import { dndOn, setLeadStatus, useOps } from "@/features/ops/store";
import { setCallFrom, setSmsFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { PhotoRail, HistoryList } from "./side-rails";
import { FormAnswers } from "./form-answers";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import { WorkTab } from "./work-tab";
import type { RecordShellProps } from "./types";

export type ConvLane = "customer" | "internal" | "notes" | "tickets" | "history" | "form";

function dndChip(dnd?: string[]) {
  if (!dnd?.length) return;
  if (dnd.length === 3) return "DND all";
  return `DND ${dnd.join(", ")}`;
}

export function RecordShell(props: RecordShellProps) {
  const [lane, setLane] = useState<ConvLane>("customer");
  const [callOpen, setCallOpen] = useState(false);
  const [draft, setDraft] = useState<"ticket" | "task" | null>(null);
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === props.personId);
  const { numbers } = useMoneySettings();

  function openThread() {
    setLane("customer");
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  function startCall() {
    if (dndOn(lead, "call")) return;
    setLane("customer");
    setCallOpen(true);
  }

  const numberMenu = numbers.map((n) => ({
    label: `${n.office} · ${n.number}`,
    onClick: () => {
      setSmsFrom(n.number);
      setCallFrom(n.number);
    },
  }));

  const acts = props.acts
    .filter((a) => a.label !== "Drop")
    .map((a) => {
      if (a.label === "Call") return { ...a, onClick: startCall, menu: numberMenu };
      if (a.label === "Text") return { ...a, onClick: openThread, menu: numberMenu };
      if (a.label === "Create" && a.menu) {
        return {
          ...a,
          menu: a.menu.map((item) => ({
            ...item,
            onClick: () => {
              setLane("tickets");
              setDraft(item.label === "Task" ? "task" : "ticket");
            },
          })),
        };
      }
      return a;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TitleRow
        kind={props.kind}
        title={props.title}
        subtitle={props.subtitle}
        stage={lead?.status ?? props.stage}
        stageTone={lead?.tone ?? props.stageTone}
        dndLabel={dndChip(lead?.dnd)}
        moneyLabel={props.moneyLabel}
        related={props.related}
        acts={acts}
        onText={openThread}
        onStage={props.kind === "lead" && lead ? (status) => setLeadStatus(lead.id, status) : undefined}
        lead={lead}
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
            {props.kind === "lead" && lead ? <LeadTools lead={lead} /> : null}
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
              <WorkTab personId={props.personId} owner={props.owner.name} draft={draft} onDraftUsed={() => setDraft(null)} />
            ) : lane === "history" ? (
              <div className="h-full overflow-auto p-3">
                <HistoryList history={props.history} flush />
              </div>
            ) : lane === "form" ? (
              lead ? <FormAnswers lead={lead} /> : <p className="p-3 text-sm text-muted">No file.</p>
            ) : (
              <ThreadPane personId={props.personId} mode={lane} onCall={startCall} dnd={lead?.dnd} />
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
  { id: "form", label: "Form", icon: ClipboardList },
];

function SideHead({
  lane,
  onLane,
}: {
  lane: ConvLane;
  onLane: (v: ConvLane) => void;
}) {
  const { barRef, measureRef, iconsOnly } = useFit();

  return (
    <div className="relative border-b border-line">
      <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1 px-2 py-2 whitespace-nowrap" aria-hidden>
        {LANES.map((l) => {
          const Icon = l.icon;
          return (
            <span key={l.id} className="flex h-10 items-center gap-1.5 rounded-md px-3 text-xs font-semibold">
              <Icon className="size-4" />
              {l.label}
            </span>
          );
        })}
      </div>
      <div ref={barRef} className="flex gap-1 px-2 py-2">
        {LANES.map((l) => {
          const Icon = l.icon;
          return (
            <Tip key={l.id} label={l.label} on={iconsOnly} side="bottom">
              <button
                type="button"
                onClick={() => onLane(l.id)}
                aria-label={l.label}
                className={cn(
                  "flex h-10 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold",
                  lane === l.id ? "bg-navy text-card" : "text-muted",
                )}
              >
                <Icon className="size-4" />
                {iconsOnly ? null : l.label}
              </button>
            </Tip>
          );
        })}
      </div>
    </div>
  );
}
