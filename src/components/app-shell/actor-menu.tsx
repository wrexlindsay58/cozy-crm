import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";
import { CozyHouse } from "@/components/cozy-mark";
import { setActor, useStaff } from "@/features/staff/store";

export function ActorMenu() {
  const { people, actorName } = useStaff();
  const [open, setOpen] = useState(false);
  const me = people.find((p) => p.name === actorName);
  const first = me?.name.split(" ")[0] ?? "You";
  return (
    <div className="relative h-full">
      <button type="button" className="flex h-full items-center gap-2 pr-3 pl-2 text-[13px] font-semibold" aria-label="Working as" onClick={() => setOpen((v) => !v)}>
        <span className="size-7 overflow-hidden rounded-sm bg-page">
          <CozyHouse className="size-7" />
        </span>
        <span className="hidden truncate sm:inline">{first}</span>
      </button>
      {open ? (
        <div className="absolute top-12 right-2 z-50 max-h-80 w-64 overflow-auto rounded-md border border-line bg-card py-1 text-ink shadow-lg">
          {people.filter((p) => p.active).map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setActor(p.name);
                setOpen(false);
              }}
              className={cn("flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm", p.name === actorName ? "bg-page font-semibold" : "hover:bg-page")}
            >
              <span className="min-w-0 truncate">{p.name}</span>
              <span className="shrink-0 text-[11px] font-semibold text-muted">{p.role}</span>
            </button>
          ))}
          <Link to="/settings" preload="intent" className="block border-t border-line px-3 py-2 text-sm font-semibold text-navy" onClick={() => setOpen(false)}>
            Settings
          </Link>
        </div>
      ) : null}
    </div>
  );
}
