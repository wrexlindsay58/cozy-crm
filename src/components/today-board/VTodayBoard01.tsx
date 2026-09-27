import { useTodayBoard } from "./useTodayBoard";
import { PageTitle } from "@/components/ui-bits";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";

export function VTodayBoard01({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { office, pickBoard, sales, setOffice, setSalesSlot } = bag;
  return (
    <>
<header className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-4">
        <PageTitle
          title={sales ? "Sales Board" : "Live Board"}
          flush
          actions={
            <span className="flex min-w-0 flex-1 items-center gap-3">
              <BookPick
                value={sales ? "sales" : "live"}
                onChange={pickBoard}
                items={[
                  { id: "live", label: "Live Board" },
                  { id: "sales", label: "Sales Board" },
                ]}
              />
              {sales ? <div ref={setSalesSlot} className="flex min-w-0 flex-1 items-center gap-2" /> : (
                <>
              <Tip label="As of this hour" on>
                <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-muted">
                  <i className="live-pip" />
                  Live
                </span>
              </Tip>
              <BookPick
                value={office}
                onChange={setOffice}
                items={[
                  { id: "all", label: "All markets" },
                  { id: "PHX", label: "Phoenix" },
                  { id: "DFW", label: "Dallas" },
                ]}
              />
                </>
              )}
            </span>
          }
        />
      </header>
    </>
  );
}
