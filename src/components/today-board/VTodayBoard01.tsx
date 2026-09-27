import { useTodayBoard } from "./useTodayBoard";
import { Tip } from "@/components/tip";
import { BookPick } from "@/features/book/pick";
import { clockLabel } from "@/lib/clock";

export function VTodayBoard01({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { office, pickBoard, sales, setOffice, setSalesSlot } = bag;
  const board = (
    <BookPick
      value={sales ? "sales" : "live"}
      onChange={pickBoard}
      className={sales ? "max-md:w-full max-md:max-w-none max-md:justify-between" : undefined}
      items={[
        { id: "live", label: "Live Board" },
        { id: "sales", label: "Sales Board", short: "Sales", hint: "Sales Board" },
      ]}
    />
  );
  if (sales) {
    return (
      <header className="flex shrink-0 items-center gap-1.5 border-b border-line bg-card px-3 py-2 md:gap-2 md:px-4">
        <h1 className="type-page hidden shrink-0 md:block">Sales Board</h1>
        <div className="min-w-0 flex-1 md:flex-none">{board}</div>
        <div ref={setSalesSlot} className="flex min-w-0 flex-[3] items-center gap-1.5 md:flex-1 md:gap-2 md:overflow-visible" />
        <p className="ml-auto hidden shrink-0 text-[13px] text-muted tabular-nums md:block">{clockLabel()}</p>
      </header>
    );
  }
  return (
    <header className="flex h-12 shrink-0 items-center gap-1.5 border-b border-line bg-card px-3 md:h-auto md:min-h-14 md:gap-2 md:px-4">
      <h1 className="type-page hidden shrink-0 md:block">Live Board</h1>
      <div className="shrink-0">{board}</div>
      <Tip label="As of this hour" on>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-muted">
          <i className="live-pip" />
          Live
        </span>
      </Tip>
      <BookPick
        value={office}
        onChange={setOffice}
        className="shrink-0"
        items={[
          { id: "all", label: "All markets" },
          { id: "PHX", label: "Phoenix" },
          { id: "DFW", label: "Dallas" },
        ]}
      />
    </header>
  );
}
