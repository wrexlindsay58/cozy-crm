import { TalkLane, CatChip } from "./bits-01";
import { ViewDesc, ActionPeople } from "./bits-02";
import { useActionQueue2 } from "./useActionQueue2";
import { ChevronLeft, FileText, Pencil, SquareArrowOutUpRight } from "lucide-react";
import { ACTION_LABEL } from "@/features/action/types";
import { ConvTabs } from "@/features/record-shell/conv-tabs";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

export function VActionQueue02({ bag }: { bag: ReturnType<typeof useActionQueue2> }) {
  const { active, editOpen, house, lane, mobileTalk, parent, setEditOpen, setLane, setMobileTalk } = bag;
  return (
    <>
<div className={cn("flex flex-col bg-card md:col-start-2 md:row-start-1", !mobileTalk && "max-md:hidden")}>
          {active && house ? (
            <>
              <header className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Back to actions"
                    className="grid size-11 shrink-0 place-items-center rounded-md text-navy md:hidden"
                    onClick={() => setMobileTalk(false)}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <a href={house.href} className="flex min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate text-sm font-semibold text-navy">{house.name}</span>
                    <span aria-label="Open house file" className="grid size-11 shrink-0 place-items-center rounded-md text-navy">
                      <SquareArrowOutUpRight className="size-4" />
                    </span>
                  </a>
                  <Tip label="Edit" on className="ml-auto">
                    <button
                      type="button"
                      aria-label="Edit"
                      aria-pressed={editOpen}
                      className={cn("grid size-11 shrink-0 place-items-center rounded-md", editOpen ? "bg-page text-navy" : "text-navy")}
                      onClick={() => setEditOpen((v) => !v)}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </Tip>
                </div>
                <p className="mt-1 flex items-center gap-2">
                  <span className="min-w-0 truncate text-[11px] font-bold tracking-wide text-muted uppercase">
                    {ACTION_LABEL[active.kind]} · {active.id}
                    {parent ? ` · on ${parent.title}` : ""}
                  </span>
                  <CatChip cat={active.category} />
                  {active.description ? <ViewDesc text={active.description} /> : null}
                </p>
                <div className="mt-0.5 min-w-0">
                  <h2 className="text-base font-extrabold break-words">{active.title}</h2>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {house.city ? `${house.city} · ` : ""}
                    {house.pipeline}
                  </p>
                </div>
                <ActionPeople owner={house.owner} assigned={active.owner} following={active.followers ?? []} />
              </header>
              <div className="mt-auto shrink-0 border-t border-line">
                <ConvTabs
                  lane={lane}
                  onLane={(id) => setLane(id as TalkLane)}
                  iconsOnly
                  extra={[{ id: "details", label: "Details", icon: FileText }]}
                  extraClassName={(id) => (id === "details" ? "md:hidden" : undefined)}
                />
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center px-3 py-3 text-sm text-muted">Pick an action.</div>
          )}
        </div>
    </>
  );
}
