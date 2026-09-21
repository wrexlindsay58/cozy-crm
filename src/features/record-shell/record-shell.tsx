import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { ClickToCall } from "@/features/lead/click-to-call";
import { MarksPanel } from "@/features/lead/marks-bar";
import { BookWidget } from "@/features/lead/book-widget";
import { dndOn, descendantsOf, setLeadStatus, useOps } from "@/features/ops/store";
import { setCallFrom, setSmsFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { PhotoRail, HistoryList } from "./side-rails";
import { FormAnswers } from "./form-answers";
import { PeopleRow } from "./people-row";
import { ThreadPane } from "./thread-pane";
import { TitleRow } from "./title-row";
import { WorkTab } from "./work-tab";
import { ConvTabs } from "./conv-tabs";
import { FilePane } from "./file-sections";
import type { ConvLane } from "./lanes";
import type { RecordShellProps } from "./types";
import { cn } from "@/lib/cn";

export type { ConvLane } from "./lanes";
export { LANES } from "./lanes";

function dndChip(dnd?: string[]) {
  if (!dnd?.length) return;
  if (dnd.length === 3) return "DND all";
  return `DND ${dnd.join(", ")}`;
}

export function RecordShell(props: RecordShellProps) {
  const [lane, setLane] = useState<ConvLane>("customer");
  const [callOpen, setCallOpen] = useState(false);
  const [draft, setDraft] = useState<"ticket" | "task" | "request" | null>(null);
  const [talkScope, setTalkScope] = useState<"action" | "house">(props.actionId ? "action" : "house");
  const [mobileTalk, setMobileTalk] = useState(false);
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === props.personId);
  const { numbers } = useMoneySettings();

  function openThread() {
    setLane("customer");
    setMobileTalk(true);
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  function startCall() {
    if (dndOn(lead, "call")) return;
    setLane("customer");
    setMobileTalk(true);
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
          menu: a.menu.map((item) => {
            if (item.label !== "Ticket" && item.label !== "Task" && item.label !== "Request") return item;
            return {
              ...item,
              onClick: () => {
                setLane("actions");
                setMobileTalk(true);
                setDraft(item.label === "Task" ? "task" : item.label === "Request" ? "request" : "ticket");
              },
            };
          }),
        };
      }
      return a;
    });

  const talkLane = lane === "customer" || lane === "internal" || lane === "notes";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(mobileTalk && "max-lg:hidden")}>
        <TitleRow
          kind={props.kind}
          title={props.title}
          subtitle={props.subtitle}
          stage={props.kind === "lead" ? (lead?.status ?? props.stage) : props.stage}
          stageTone={props.kind === "lead" ? (lead?.tone ?? props.stageTone) : props.stageTone}
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
          actionId={props.actionId}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", mobileTalk && "max-lg:hidden")}>
          <FilePane
            foot={
              <>
                <div className="px-0">
                  <PhotoRail personId={props.personId} photos={props.photos} />
                </div>
                <button
                  type="button"
                  className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-line text-sm font-semibold text-navy lg:hidden"
                  onClick={() => setMobileTalk(true)}
                >
                  Talk
                </button>
              </>
            }
          >
            {props.children}
          </FilePane>
        </div>

        <aside
          className={cn(
            "flex min-h-0 min-w-0 shrink-0 flex-col border-line bg-card",
            "h-[55vh] border-t lg:h-auto lg:w-[45%] lg:min-w-[40%] lg:max-w-[50%] lg:border-t-0 lg:border-l",
            !mobileTalk && "max-lg:hidden",
            mobileTalk && "max-lg:h-auto max-lg:flex-1 max-lg:border-t-0",
          )}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-line px-2 lg:hidden">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-0.5 text-sm font-semibold text-navy"
              onClick={() => setMobileTalk(false)}
            >
              <ChevronLeft className="size-4" />
              File
            </button>
            <p className="min-w-0 truncate text-sm font-semibold">{props.title}</p>
          </div>
          <SideHead lane={lane} onLane={setLane} withBook={Boolean(lead)} />
          <div className="min-h-0 flex-1 overflow-hidden">
            {callOpen && lead?.phone ? (
              <div className="p-2">
                <ClickToCall
                  personId={props.personId}
                  phone={lead.phone}
                  name={lead.name}
                  open={callOpen}
                  onClose={() => setCallOpen(false)}
                  actionId={props.actionId}
                  actionKind={props.actionKind}
                />
              </div>
            ) : null}
            {lane === "actions" ? (
              <WorkTab
                personId={props.personId}
                owner={props.owner.name}
                draft={draft}
                onDraftUsed={() => setDraft(null)}
                parentId={props.actionId}
              />
            ) : lane === "tags" ? (
              lead ? <MarksPanel lead={lead} /> : <p className="p-3 text-sm text-muted">No file.</p>
            ) : lane === "history" ? (
              <div className="h-full overflow-auto p-3">
                <HistoryList history={props.history} flush />
              </div>
            ) : lane === "media" ? (
              <PhotoRail
                personId={props.personId}
                photos={props.photos}
                flush
                actionId={props.actionId}
                actionKind={props.actionKind}
                actionIds={props.actionId ? [props.actionId, ...descendantsOf(props.actionId)] : undefined}
                scope={props.actionId ? talkScope : "house"}
                onScope={props.actionId ? setTalkScope : undefined}
              />
            ) : lane === "form" ? (
              lead ? <FormAnswers lead={lead} /> : <p className="p-3 text-sm text-muted">No file.</p>
            ) : lane === "book" ? (
              lead ? (
                <div className="h-full overflow-auto p-3">
                  <BookWidget
                    leadId={lead.id}
                    defaultCloser={lead.closer}
                    defaultKind={props.actionId ? "Callback" : "Sales"}
                    flush
                    actionTitle={props.actionTitle}
                  />
                </div>
              ) : (
                <p className="p-3 text-sm text-muted">Book from the house file.</p>
              )
            ) : talkLane ? (
              <ThreadPane
                personId={props.personId}
                mode={lane}
                onCall={startCall}
                dnd={lead?.dnd}
                actionId={props.actionId}
                actionKind={props.actionKind}
                actionTitle={props.actionTitle}
                actionIds={props.actionId ? [props.actionId, ...descendantsOf(props.actionId)] : undefined}
                scope={props.actionId ? talkScope : "house"}
                onScope={props.actionId ? setTalkScope : undefined}
              />
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function SideHead({
  lane,
  onLane,
  withBook,
}: {
  lane: ConvLane;
  onLane: (v: ConvLane) => void;
  withBook?: boolean;
}) {
  return <ConvTabs lane={lane} onLane={(id) => onLane(id as ConvLane)} withBook={withBook} />;
}
