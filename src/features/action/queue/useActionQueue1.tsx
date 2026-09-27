import { KindFilter, TalkLane, SortKey, remembered } from "./bits-01";
import { compareActions } from "./bits-03";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { ActionKind } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { liveStatus } from "@/lib/chrome";

export function useActionQueue1({ selectedId }: { selectedId?: string }) {
const { actions, leads, history } = useOps();

const { people, viewAs, actorName: me } = useStaff();

const navigate = useNavigate();

const [query, setQuery] = useState(remembered.query);

const [kind, setKind] = useState<KindFilter>(remembered.kind);

const [status, setStatus] = useState(remembered.status);

const [sort, setSort] = useState<SortKey>(remembered.sort);

const [office, setOffice] = useState(remembered.office);

const [activeId, setActiveId] = useState(selectedId ?? actions[0]?.id ?? "");

const [lane, setLane] = useState<TalkLane>("internal");

const [talkScope, setTalkScope] = useState<"action" | "house">("action");

const [mobileTalk, setMobileTalk] = useState(Boolean(selectedId));

const [creating, setCreating] = useState<ActionKind | null>(null);

const [nestUnderId, setNestUnderId] = useState<string | null>(null);

const [callOpen, setCallOpen] = useState(false);

const [editOpen, setEditOpen] = useState(false);

useEffect(() => {
    remembered.query = query;
    remembered.kind = kind;
    remembered.status = status;
    remembered.sort = sort;
    remembered.office = office;
  }, [query, kind, status, sort, office]);

useEffect(() => {
    if (selectedId) {
      setActiveId(selectedId);
      setTalkScope("action");
      setLane("internal");
      setCallOpen(false);
    }
  }, [selectedId]);

const counts = useMemo(() => {
    const pool = office === "all" ? actions : actions.filter((a) => houseOf(a.personId, leads).office === office);
    return {
      all: pool.length,
      ticket: pool.filter((a) => a.kind === "ticket").length,
      task: pool.filter((a) => a.kind === "task").length,
      request: pool.filter((a) => a.kind === "request").length,
    };
  }, [actions, office, leads]);

const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = actions.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (office !== "all" && houseOf(a.personId, leads).office !== office) return false;
      if (status !== "all" && liveStatus(a.status, a.due) !== status) return false;
      if (!needle) return true;
      const house = houseOf(a.personId, leads);
      return [a.title, a.id, a.owner, a.kind, a.description, house.name, house.id, house.city]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return [...filtered].sort((a, b) => compareActions(a, b, sort, leads));
  }, [actions, kind, status, sort, query, leads, office]);
  return { selectedId, actions, leads, history, people, viewAs, me, navigate, query, setQuery, kind, setKind, status, setStatus, sort, setSort, office, setOffice, activeId, setActiveId, lane, setLane, talkScope, setTalkScope, mobileTalk, setMobileTalk, creating, setCreating, nestUnderId, setNestUnderId, callOpen, setCallOpen, editOpen, setEditOpen, counts, rows };
}
