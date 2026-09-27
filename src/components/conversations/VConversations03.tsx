import { BlockMenu } from "./bits-02";
import { PhoneSplit } from "./bits-03";
import { LaneHead } from "./bits-06";
import { useConversations3 } from "./useConversations3";
import { Calendar, ChevronLeft, SquareArrowOutUpRight, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { stageWash } from "@/lib/lead-status";
import { DndPick } from "@/features/lead/dnd-pick";
import { dndOn } from "@/features/ops/store";
import { toggleStar } from "@/features/thread/store";
import { Tip } from "@/components/tip";

export function VConversations03({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  const { acc, active, lane, lead, personId, setCallOpen, setLane, setMobileThread, starred } = bag;
  return (
    <>
<header className="border-b border-line px-3 py-2 md:hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Back to inbox"
                    className="grid size-10 shrink-0 place-items-center rounded-md text-navy"
                    onClick={() => setMobileThread(false)}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="type-section min-w-0 truncate">{active.name}</h2>
                    <Tip label="Open file" on>
                      <a
                        href={active.pipe.href}
                        aria-label="Open file"
                        className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-navy"
                      >
                        <SquareArrowOutUpRight className="size-4" />
                      </a>
                    </Tip>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2 overflow-x-auto">
                  {active.status ? (
                    <span className={cn("h-7 shrink-0 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase leading-7", stageWash(active.tone))}>
                      {active.status}
                    </span>
                  ) : null}
                  <span className="h-7 shrink-0 rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase leading-7">
                    {active.pipe.label}
                  </span>
                  {lead ? <DndPick lead={lead} compact /> : null}
                  <PhoneSplit disabled={dndOn(lead, "call") || !active.phone} onCall={() => setCallOpen(true)} />
                  <Tip label="Book" on>
                    <button type="button" aria-label="Book" className="grid size-9 shrink-0 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                      <Calendar className="size-4" />
                    </button>
                  </Tip>
                  <Tip label={starred ? "Unstar" : "Star"} on>
                    <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-9 shrink-0 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                      <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                    </button>
                  </Tip>
                  <BlockMenu name={active.name} ids={[active.id, personId, acc?.id ?? ""]} />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {active.phone}
                  {active.city ? ` · ${active.city}` : ""}
                  {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
                </p>
              </header>
              <header className="hidden min-h-14 items-center gap-3 border-b border-line px-3 py-2 md:flex">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="type-section min-w-0 truncate">{active.name}</h2>
                    <Tip label="Open file" on>
                      <a href={active.pipe.href} aria-label="Open file" className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-navy">
                        <SquareArrowOutUpRight className="size-4" />
                      </a>
                    </Tip>
                    {active.status ? (
                      <span className={cn("h-7 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase leading-7", stageWash(active.tone))}>
                        {active.status}
                      </span>
                    ) : null}
                    <span className="h-7 rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase leading-7">
                      {active.pipe.label}
                    </span>
                    {lead ? <DndPick lead={lead} compact /> : null}
                  </div>
                  <p className="text-[11px] text-muted">
                    {active.phone}
                    {active.city ? ` · ${active.city}` : ""}
                    {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <PhoneSplit disabled={dndOn(lead, "call") || !active.phone} onCall={() => setCallOpen(true)} />
                  <Tip label="Book" on>
                    <button type="button" aria-label="Book" className="grid size-9 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                      <Calendar className="size-4" />
                    </button>
                  </Tip>
                  <Tip label={starred ? "Unstar" : "Star"} on>
                    <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-9 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                      <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                    </button>
                  </Tip>
                  <BlockMenu name={active.name} ids={[active.id, personId, acc?.id ?? ""]} />
                </div>
              </header>
              <LaneHead lane={lane} onLane={setLane} />
    </>
  );
}
