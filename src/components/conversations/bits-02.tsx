import { useState } from "react";
import { Ban } from "lucide-react";
import { cn } from "@/lib/cn";
import { actingName } from "@/features/staff/store";
import { addHistory } from "@/features/ops/store";
import { blockAndDelete, blockContacts, isBlocked, unblockContacts } from "@/features/thread/store";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";

export function BlockMenu({ name, ids }: { name: string; ids: string[] }) {
  const clean = ids.filter(Boolean);
  const blocked = clean.some((id) => isBlocked(id));
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <Tip label={blocked ? "Blocked" : "Block"} on={!open}>
        <button
          type="button"
          aria-label={blocked ? "Blocked" : "Block"}
          aria-expanded={open}
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-md border",
            blocked ? "border-stop text-stop" : "border-line text-navy",
          )}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
        >
          <Ban className="size-4" />
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={close}>
          {blocked ? (
            <button
              type="button"
              className="block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page"
              onClick={() => {
                unblockContacts(clean);
                addHistory(clean[0] ?? "", actingName(), `Unblocked ${name}.`);
                close();
              }}
            >
              Unblock
            </button>
          ) : (
            <button
              type="button"
              className="block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page"
              onClick={() => {
                blockContacts(clean);
                addHistory(clean[0] ?? "", actingName(), `Blocked ${name}.`);
                close();
              }}
            >
              Block
            </button>
          )}
          <button
            type="button"
            className="block w-full min-w-52 px-3 py-2 text-left text-sm text-stop hover:bg-page"
            onClick={() => {
              blockAndDelete(clean);
              addHistory(clean[0] ?? "", actingName(), `Blocked ${name} and deleted the conversation.`);
              close();
            }}
          >
            Delete and block
          </button>
        </Float>
      ) : null}
    </>
  );
}
