import { useConversations3 } from "./useConversations3";
import { ClickToCall } from "@/features/lead/click-to-call";
import { MarksPanel } from "@/features/lead/marks-bar";
import { BookWidget } from "@/features/lead/book-widget";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { WorkTab } from "@/features/record-shell/work-tab";

export function VConversations04({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  const { active, callOpen, history, lane, lead, me, personId, setCallOpen, threadId } = bag;
  return (
    <>
<div className="min-h-0 flex-1 overflow-hidden">
                {callOpen && active.phone ? (
                  <div className="p-2">
                    <ClickToCall personId={threadId} phone={active.phone} name={active.name} open={callOpen} onClose={() => setCallOpen(false)} />
                  </div>
                ) : null}
                {lane === "actions" ? (
                  <WorkTab personId={personId} owner={me} />
                ) : lane === "tags" ? (
                  lead ? <MarksPanel lead={lead} /> : <p className="p-3 text-sm text-muted">No file.</p>
                ) : lane === "history" ? (
                  <div className="h-full overflow-auto p-3">
                    <HistoryList history={history?.[threadId] ?? history?.[personId] ?? []} flush />
                  </div>
                ) : lane === "media" ? (
                  <div className="h-full overflow-auto">
                    <PhotoRail personId={threadId} flush />
                  </div>
                ) : lane === "form" ? (
                  lead ? <FormAnswers lead={lead} /> : <p className="p-3 text-sm text-muted">No form.</p>
                ) : lane === "book" ? (
                  <div className="overflow-auto p-3">
                    <BookWidget leadId={personId} defaultCloser={active.closer} defaultKind="Sales" flush />
                  </div>
                ) : (
                  <ThreadPane
                    personId={threadId}
                    mode={lane as "customer" | "internal" | "notes"}
                    onCall={() => setCallOpen(true)}
                    dnd={lead?.dnd}
                  />
                )}
              </div>
    </>
  );
}
