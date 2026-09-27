import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { cn } from "@/lib/cn";
import { money } from "@/lib/crm-data";
import { SECTIONS, ReadyCell, PacketLine } from "./part-01";
import { emailPaper } from "./part-02";
import { ChaseForm } from "./part-04";
import { PaperPageView } from "./part-05";

export function PaperPageView2(props: { bag: { mobilePacket: any; morning: any; query: any; setQuery: any; mine: any; view: any; setMine: any; setView: any; kind: any; rows: any; viewAs: any; people: any; setKind: any; batches: any; sendBatch: any; visible: any; focused: any; setComposer: any; setJobId: any; setFocus: any; setMobilePacket: any; act: any; job: any; ready: any; packet: any; composing: any; actor: any; advance: any; preview: any } }) {
  const { mobilePacket, morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind, batches, sendBatch, visible, focused, setComposer, setJobId, setFocus, setMobilePacket, act, job, ready, packet, composing, actor, advance, preview } = props.bag;
  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-page lg:flex-row">
      <PaperPageView bag={{ mobilePacket, morning, query, setQuery, mine, view, setMine, setView, kind, rows, viewAs, people, setKind, batches, sendBatch, visible, focused, setComposer, setJobId, setFocus, setMobilePacket, act }} />
      <section className={cn("min-h-0 min-w-0 flex-1 flex-col bg-page lg:flex", mobilePacket ? "flex" : "max-lg:hidden")}>
        {job && ready ? (
          <>
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-card px-4 py-3">
              <div className="min-w-0">
                <button type="button" className="mb-1 text-sm font-semibold text-navy lg:hidden" onClick={() => setMobilePacket(false)}>
                  Back to paper
                </button>
                <h2 className="type-section truncate">{packet[0]?.customer || job.name}</h2>
                <p className="type-meta mt-1">{job.product}</p>
              </div>
              <Link to="/projects/$projectId" params={{ projectId: job.jobId }} className="shrink-0 text-sm font-semibold text-navy">
                Open job
              </Link>
            </header>
            <div className="min-h-0 w-full min-w-0 flex-1 overflow-auto bg-page">
              <div className="flex w-full min-w-0 flex-col gap-3 p-4">
                <div className="grid w-full grid-cols-2 overflow-hidden rounded-md border border-line bg-card sm:grid-cols-4">
                  <ReadyCell label="Agreement" value={ready.agreement} bad={!ready.agreementOk} />
                  <ReadyCell label="Materials" value={ready.materials} bad={!ready.materialsOk && ready.materials !== "None yet"} />
                  <ReadyCell label="Work order" value={ready.work} bad={!ready.workOk && ready.work !== "None yet"} />
                  <ReadyCell label="Balance" value={money(ready.balance)} bad={ready.balance > 0} />
                </div>
                {ready.lender > 0 ? (
                  <section className="w-full rounded-md border border-line bg-card px-4 py-3">
                    <h3 className="type-label">Lender</h3>
                    <p className="mt-1 text-sm font-semibold">GoodLeap</p>
                    <p className="type-meta mt-1">{money(ready.lender)} not funded</p>
                  </section>
                ) : null}
                {composing ? <ChaseForm row={composing} who={actor} onDone={() => advance(composing)} onClose={() => setComposer(null)} /> : null}
                {preview && !composing ? (
                  <div className="flex h-[72vh] min-h-[36rem] w-full min-w-0 flex-col overflow-hidden rounded-md border border-line bg-card">
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2">
                      <p className="type-meta truncate">{focused?.fileName || focused?.number || "Agreement"}</p>
                      {focused && !focused.internal && focused.fileUrl ? (
                        <button type="button" aria-label="Email" className="grid size-9 place-items-center text-navy" onClick={() => emailPaper(focused)}>
                          <Mail className="size-4" />
                        </button>
                      ) : null}
                    </div>
                    <iframe title={focused?.fileName || "Agreement"} srcDoc={preview} className="min-h-0 w-full flex-1 bg-white" />
                  </div>
                ) : null}
                {SECTIONS.map((section) => {
                  const list = packet.filter((r: any) => r.kind === section.kind && !r.internal && !r.mismatch && !r.lender);
                  const internal = packet.filter((r: any) => r.kind === section.kind && r.internal);
                  return (
                    <section key={section.kind} className="w-full min-w-0 rounded-md border border-line bg-card px-4 py-3">
                      <h3 className="type-label">{section.label}</h3>
                      {list.length === 0 ? <p className="type-meta mt-2">{section.empty}</p> : <ul className="mt-2 divide-y divide-line">{list.map((row: any) => <PacketLine key={row.id} row={row} open={row.id === focused?.id} onOpen={() => { setFocus(row.id); setComposer(null); }} onAct={() => act(row)} />)}</ul>}
                      {internal.length ? (
                        <div className="mt-3 border-t border-line pt-3">
                          <p className="type-meta">Internal pay. Not sent to the customer.</p>
                          <ul className="mt-2 divide-y divide-line">{internal.map((row: any) => <PacketLine key={row.id} row={row} open={row.id === focused?.id} onOpen={() => setFocus(row.id)} onAct={() => act(row)} />)}</ul>
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <p className="type-meta p-6">No paper yet.</p>
        )}
      </section>
    </main>
  );
}
