import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useOps } from "@/features/ops/store";
import { searchFiles } from "@/lib/search-files";

export function Omnibox({ compact }: { compact?: boolean }) {
  const { leads, actions } = useOps();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = searchFiles(q, leads, actions);

  useEffect(() => {
    if (!q.trim()) setOpen(false);
    else setOpen(true);
  }, [q]);

  function go(href: string) {
    setOpen(false);
    setQ("");
    void navigate({ to: href as never });
  }

  return (
    <div className={compact ? "relative w-full" : "relative min-w-0 flex-1"}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q.trim().length >= 2 && setOpen(true)}
        placeholder="Name, phone, address"
        className="h-10 w-full rounded-md border-0 bg-card pr-3 pl-9 text-[13px] text-ink outline-none placeholder:text-faint"
      />
      {open ? (
        <ul className="absolute top-11 z-50 max-h-80 w-full overflow-auto rounded-md border border-line bg-card shadow-sm">
          {hits.length === 0 ? <li className="px-3 py-3 text-sm text-muted">No files match.</li> : null}
          {hits.map((h) => (
            <li key={h.href + h.kind}>
              <button type="button" onClick={() => go(h.href)} className="flex w-full flex-col items-start px-3 py-2.5 text-left hover:bg-page">
                <span className="text-sm font-semibold">{h.name}</span>
                <span className="text-[11px] text-muted">
                  {h.kind} · {h.detail}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
