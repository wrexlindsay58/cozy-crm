import { useActionQueue1 } from "./useActionQueue1";
import { useMemo } from "react";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import { descendantsOf } from "@/features/ops/store";
import { liveStatus } from "@/lib/chrome";

export function useActionQueue2(bag: ReturnType<typeof useActionQueue1>) {
  const { actions, leads, navigate, query, kind, office, activeId, setActiveId, setLane, setTalkScope, setMobileTalk, setCreating, setNestUnderId, setCallOpen, rows } = bag;
const tally = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const pool = actions.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (office !== "all" && houseOf(a.personId, leads).office !== office) return false;
      if (!needle) return true;
      const house = houseOf(a.personId, leads);
      return [a.title, a.id, a.owner, a.kind, a.description, house.name, house.id, house.city]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    let past = 0;
    let soon = 0;
    let open = 0;
    let complete = 0;
    let pause = 0;
    let cancel = 0;
    for (const a of pool) {
      const s = liveStatus(a.status, a.due);
      if (s === "Past Due") past += 1;
      else if (s === "Due Soon") soon += 1;
      else if (s === "Complete") complete += 1;
      else if (s === "Pause") pause += 1;
      else if (s === "Cancel") cancel += 1;
      else open += 1;
    }
    return { past, soon, open, complete, pause, cancel };
  }, [actions, kind, query, leads, office]);

const active = actions.find((a) => a.id === activeId) ?? rows[0];

const house = active ? houseOf(active.personId, leads) : undefined;

const parent = active?.parentId ? actions.find((a) => a.id === active.parentId) : undefined;

const kidIds = active ? [active.id, ...descendantsOf(active.id)] : [];

function open(id: string) {
    setActiveId(id);
    setTalkScope("action");
    setLane("internal");
    setCallOpen(false);
    setMobileTalk(true);
    void navigate({ to: "/tickets/$actionId", params: { actionId: id } });
  }

function onCreated(row: ShopAction | undefined) {
    setCreating(null);
    setNestUnderId(null);
    if (row) open(row.id);
  }

function startCreate(kind: ActionKind, parentId?: string) {
    setNestUnderId(parentId ?? null);
    setCreating(kind);
  }
  return { ...bag, tally, active, house, parent, kidIds, open, onCreated, startCreate };
}
