import { DetailRail } from "./bits-04";
import { useActionQueue2 } from "./useActionQueue2";
import { X } from "lucide-react";

export function VActionQueue04({ bag }: { bag: ReturnType<typeof useActionQueue2> }) {
  const { active, editOpen, house, setEditOpen, startCreate } = bag;
  return (
    <>
{active && house && editOpen ? (
          <aside className="absolute inset-y-0 right-0 z-20 flex w-[min(100%,22rem)] min-h-0 flex-col overflow-auto border-l border-line bg-card shadow-sm md:static md:z-auto md:col-start-3 md:row-span-2 md:row-start-1 md:w-auto md:min-w-0 md:shadow-none">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-2">
              <p className="px-2 text-[11px] font-bold tracking-wide text-muted uppercase">Edit</p>
              <button type="button" aria-label="Close edit" className="grid size-10 place-items-center" onClick={() => setEditOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <DetailRail action={active} house={house} onAdd={(k) => startCreate(k, active.id)} />
          </aside>
        ) : null}
    </>
  );
}
