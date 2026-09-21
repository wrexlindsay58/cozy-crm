import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FileSection = { id: string; label: string; node: ReactNode };

const FilePaneFoot = createContext<ReactNode>(null);
let paneEl: HTMLDivElement | null = null;

export function FilePane({ foot, children }: { foot?: ReactNode; children: ReactNode }) {
  return <FilePaneFoot.Provider value={foot}>{children}</FilePaneFoot.Provider>;
}

export function scrollFileSection(id: string) {
  const pane = paneEl;
  const el = document.getElementById(`sec-${id}`) ?? document.getElementById(id);
  if (!pane || !el) return;
  const top = el.getBoundingClientRect().top - pane.getBoundingClientRect().top + pane.scrollTop;
  pane.scrollTo({ top, behavior: "smooth" });
}

export function FileSections({ sections }: { sections: FileSection[] }) {
  const foot = useContext(FilePaneFoot);
  const paneRef = useRef<HTMLDivElement>(null);
  const items = sections.filter((s) => s.node != null);
  const [active, setActive] = useState(items[0]?.id ?? "");
  if (items.length === 0) return null;

  function go(id: string) {
    setActive(id);
    paneEl = paneRef.current;
    scrollFileSection(id);
  }

  const idx = Math.max(0, items.findIndex((s) => s.id === active));
  const next = items[idx + 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {items.length > 1 ? (
        <nav className="flex shrink-0 items-center gap-1 overflow-hidden border-b border-line bg-card px-1.5 py-1.5 md:px-2">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {items.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(s.id)}
                className={cn(
                  "h-8 shrink-0 rounded-md px-2.5 text-[12px] font-semibold",
                  s.id === active ? "bg-navy text-card" : "text-muted hover:text-navy",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {next ? (
            <button type="button" onClick={() => go(next.id)} className="h-8 shrink-0 px-2 text-[12px] font-semibold text-navy">
              Skip
            </button>
          ) : null}
        </nav>
      ) : null}
      <div
        ref={(n) => {
          paneRef.current = n;
          paneEl = n;
        }}
        className="min-h-0 flex-1 space-y-3 overflow-auto overscroll-none p-2 md:p-2.5"
      >
        {items.map((s) => (
          <div key={s.id} id={`sec-${s.id}`}>
            {s.node}
          </div>
        ))}
        {foot}
      </div>
    </div>
  );
}