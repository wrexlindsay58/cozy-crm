import { useState } from "react";
import { BlockMenu } from "./bits-02";
import { PhoneSplit } from "./bits-03";
import { LaneHead } from "./bits-06";
import { useConversations3 } from "./useConversations3";
import { Calendar, ChevronDown, ChevronLeft, SquareArrowOutUpRight, Star } from "lucide-react";
import { cn } from "@/lib/cn";
import { stageWash } from "@/lib/lead-status";
import { DndPick } from "@/features/lead/dnd-pick";
import { dndOn } from "@/features/ops/store";
import { toggleStar } from "@/features/thread/store";
import { Tip } from "@/components/tip";

const PIPE_SHORT: Record<string, string> = { Opportunity: "Opps", Assessment: "Assess", Membership: "Members" };

export function VConversations03({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  const { acc, active, lane, lead, personId, setCallOpen, setLane, setMobileThread, starred } = bag;
  const [open, setOpen] = useState(false);
  const pipe = PIPE_SHORT[active.pipe.label] ?? active.pipe.label;

  function toggleHead() {
    setOpen((v) => !v);
  }

  function back() {
    return (
      <button type="button" className="-ml-0.5 inline-flex h-8 shrink-0 items-center gap-0.5 text-[13px] font-semibold text-navy" onClick={() => setMobileThread(false)}>
        <ChevronLeft className="size-4" />
        Inbox
      </button>
    );
  }

  function chevron() {
    return (
      <button type="button" className={cn("relative -mr-2 grid h-8 w-8 shrink-0 place-items-center text-muted", !open && "-ml-[3px]")} aria-expanded={open} aria-label={open ? "Collapse header" : "Expand header"} onClick={toggleHead}>
        <ChevronDown className={cn("size-4", open && "rotate-180")} />
      </button>
    );
  }

  function pills() {
    return (
      <>
        {active.status ? (
          <span className={cn("inline-flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-bold tracking-wide uppercase", stageWash(active.tone))}>{active.status}</span>
        ) : null}
        <span className="inline-flex h-7 shrink-0 items-center rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase">{pipe}</span>
      </>
    );
  }

  return (
    <>
      <header className={cn("border-b border-line bg-card px-3 md:hidden", open ? "py-2" : "py-1")}>
        {open ? (
          <div className="mb-1 flex items-center">
            {back()}
            <span className="ml-auto">{chevron()}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-1.5">
          {open ? null : back()}
          <h2 className={cn("min-w-0 truncate font-extrabold tracking-tight", open ? "text-lg" : "flex-1 text-base")}>{active.name}</h2>
          <Tip label="Open file" on>
            <a href={active.pipe.href} aria-label="Open file" className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-navy">
              <SquareArrowOutUpRight className="size-4" />
            </a>
          </Tip>
          {open ? <div className="ml-auto flex shrink-0 items-center gap-1">{pills()}</div> : lead ? <DndPick lead={lead} compact /> : null}
          {open ? null : chevron()}
        </div>
        {open ? (
          <>
            <p className="mt-0.5 truncate text-[13px] text-muted">
              {active.phone}
              {active.city ? ` · ${active.city}` : ""}
              {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
            </p>
            <div className="mt-2 flex items-center justify-end gap-1 overflow-x-auto">
              {lead ? <DndPick lead={lead} compact /> : null}
              <PhoneSplit className="h-8" disabled={dndOn(lead, "call") || !active.phone} onCall={() => setCallOpen(true)} />
              <Tip label="Book" on>
                <button type="button" aria-label="Book" className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                  <Calendar className="size-4" />
                </button>
              </Tip>
              <Tip label={starred ? "Unstar" : "Star"} on>
                <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-8 shrink-0 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                  <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                </button>
              </Tip>
              <BlockMenu name={active.name} ids={[active.id, personId, acc?.id ?? ""]} />
            </div>
          </>
        ) : null}
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
