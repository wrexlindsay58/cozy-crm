import { EventChip } from "../chip";
import { pack } from "../layout";
import { hourOf, isoFromDateHour, toIso } from "../time";

export function DaySpanView(props: { bag: { colsTemplate: any; cols: any; hours: any; span: any; events: any; onSlot: any; onMove: any; startH: any; selectedId: any; onSelect: any } }) {
  const { colsTemplate, cols, hours, span, events, onSlot, onMove, startH, selectedId, onSelect } = props.bag;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-card">
      <div className="grid h-12 shrink-0" style={{ gridTemplateColumns: colsTemplate }}>
        <div className="border-r border-b border-line bg-card" />
        {cols.map((d: any) => (
          <div key={toIso(d).slice(0, 10)} className="flex min-w-0 flex-col justify-center border-r border-b border-line bg-card px-2">
            <p className="truncate text-[12px] font-semibold">{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className="text-[11px] text-muted">{d.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid min-h-0 min-w-0 flex-1" style={{ gridTemplateColumns: colsTemplate }}>
        <div className="relative border-r border-line bg-card">
          {hours.map((h: any, i: any) => (
            <div
              key={h}
              className="absolute inset-x-0 border-b border-line px-1 text-right text-[10px] font-bold text-muted"
              style={{ top: `${(i / span) * 100}%`, height: `${100 / span}%` }}
            >
              {h === 12 ? "12" : h > 12 ? `${h - 12}p` : `${h}a`}
            </div>
          ))}
        </div>
        {cols.map((d: any) => {
          const key = toIso(d).slice(0, 10);
          const mine = events.filter((e: any) => e.start.slice(0, 10) === key);
          return (
            <div key={key} className="relative z-0 isolate min-w-0 overflow-hidden border-r border-line bg-page">
              {hours.map((h: any, i: any) => (
                <button
                  key={h}
                  type="button"
                  className="absolute inset-x-0 border-b border-line/80"
                  style={{ top: `${(i / span) * 100}%`, height: `${100 / span}%` }}
                  onClick={() => onSlot("", isoFromDateHour(d, h))}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/book-id");
                    if (id) onMove(id, "", isoFromDateHour(d, h));
                  }}
                  aria-label={key}
                />
              ))}
              {pack(mine).map((p) => {
                const hrs = Math.max(0.45, hourOf(p.e.end) - hourOf(p.e.start));
                const shift = p.cols > 1 ? (p.col / p.cols) * 46 : 0;
                return (
                  <div
                    key={p.e.id}
                    className="absolute"
                    style={{
                      top: `${((hourOf(p.e.start) - startH) / span) * 100}%`,
                      height: `${(hrs / span) * 100}%`,
                      left: `calc(${shift}% + 2px)`,
                      width: `calc(${100 - shift}% - 4px)`,
                      zIndex: 1 + p.col,
                    }}
                  >
                    <EventChip e={p.e} selected={selectedId === p.e.id} thin={p.cols >= 3 || hrs < 1} onClick={() => onSelect(p.e.id)} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
