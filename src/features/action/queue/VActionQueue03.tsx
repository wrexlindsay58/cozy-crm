import { DetailRail } from "./bits-04";
import { useActionQueue2 } from "./useActionQueue2";
import { dndOn } from "@/features/ops/store";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { WorkTab } from "@/features/record-shell/work-tab";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { ClickToCall } from "@/features/lead/click-to-call";
import { BookWidget } from "@/features/lead/book-widget";
import { MarksPanel } from "@/features/lead/marks-bar";

export function VActionQueue03({ bag }: { bag: ReturnType<typeof useActionQueue2> }) {
  const { active, callOpen, history, house, kidIds, lane, setCallOpen, setLane, setTalkScope, startCreate, talkScope } = bag;
  return (
    <>
{active && house ? (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">
                {lane === "actions" ? (
                  <WorkTab personId={active.personId} owner={active.owner} parentId={active.id} />
                ) : lane === "history" ? (
                  <div className="h-full overflow-auto p-3">
                    <HistoryList history={history?.[active.personId] ?? []} flush />
                  </div>
                ) : lane === "media" ? (
                  <PhotoRail
                    key={active.id}
                    personId={active.personId}
                    flush
                    actionId={active.id}
                    actionKind={active.kind}
                    actionIds={kidIds}
                    scope={talkScope}
                    onScope={setTalkScope}
                  />
                ) : lane === "tags" ? (
                  house.lead ? (
                    <MarksPanel lead={house.lead} />
                  ) : (
                    <p className="p-3 text-sm text-muted">Tags live on the house file.</p>
                  )
                ) : lane === "form" ? (
                  house.lead ? (
                    <FormAnswers lead={house.lead} />
                  ) : (
                    <p className="p-3 text-sm text-muted">Form lives on the house file.</p>
                  )
                ) : lane === "book" ? (
                  house.lead ? (
                    <div className="h-full overflow-auto p-3">
                      <BookWidget
                        key={active.id}
                        leadId={house.lead.id}
                        defaultCloser={house.lead.closer}
                        defaultKind="Callback"
                        pipeline="Actions"
                        flush
                        actionTitle={active.title}
                      />
                    </div>
                  ) : (
                    <p className="p-3 text-sm text-muted">Book from the house file.</p>
                  )
                ) : lane === "details" ? (
                  <div className="h-full overflow-auto p-3 md:hidden">
                    <DetailRail action={active} house={house} onAdd={(k) => startCreate(k, active.id)} />
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    {callOpen && house.phone ? (
                      <div className="shrink-0 p-2">
                        <ClickToCall
                          personId={active.personId}
                          phone={house.phone}
                          name={house.name}
                          open={callOpen}
                          onClose={() => setCallOpen(false)}
                          actionId={active.id}
                          actionKind={active.kind}
                        />
                      </div>
                    ) : null}
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <ThreadPane
                        personId={active.personId}
                        mode={lane}
                        onCall={
                          house.phone
                            ? () => {
                                if (dndOn(house.lead, "call")) return;
                                setLane("customer");
                                setCallOpen(true);
                              }
                            : undefined
                        }
                        dnd={house.lead?.dnd}
                        actionId={active.id}
                        actionKind={active.kind}
                        actionTitle={active.title}
                        actionIds={kidIds}
                        scope={talkScope}
                        onScope={setTalkScope}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-muted">Pick an action.</div>
          )}
    </>
  );
}
