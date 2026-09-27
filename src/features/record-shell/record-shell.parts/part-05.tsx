import { ChevronLeft } from "lucide-react";
import { ClickToCall } from "@/features/lead/click-to-call";
import { MarksPanel } from "@/features/lead/marks-bar";
import { BookWidget } from "@/features/lead/book-widget";
import { descendantsOf } from "@/features/ops/store";
import { PhotoRail, HistoryList } from "../side-rails";
import { FormAnswers } from "../form-answers";
import { ThreadPane } from "../thread-pane";
import { WorkTab } from "../work-tab";
import { cn } from "@/lib/cn";
import { pipeName, SideHead } from "./part-01";

export function RecordShellView60(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <aside
          className={cn(
            "flex min-h-0 min-w-0 shrink-0 flex-col border-line bg-card",
            "h-[55vh] border-t lg:col-start-3 lg:row-start-1 lg:h-auto lg:w-auto lg:min-w-0 lg:max-w-none lg:border-t-0 lg:border-l",
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
                pipeline={pipeName(props.kind)}
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
                    pipeline={pipeName(props.kind)}
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
  );
}
