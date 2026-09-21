import { useEffect, useMemo, useRef, useState, type SelectHTMLAttributes } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, Ban, ChevronDown, ChevronLeft, Circle, CircleAlert, CircleCheck, CircleDot, Clock, FileText, Layers, Pause, Pencil, Search, SquareArrowOutUpRight, X } from "lucide-react";
import { ACTION_LABEL, workTone, type ActionKind, type ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import {
  createAction,
  deleteAction,
  descendantsOf,
  dndOn,
  patchAction,
  useOps,
} from "@/features/ops/store";
import { OFFICES, useStaff } from "@/features/staff/store";
import { WorkMoves } from "@/features/action/moves";
import { Initials } from "@/features/record-shell/people-row";
import { ConvTabs } from "@/features/record-shell/conv-tabs";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { WorkTab } from "@/features/record-shell/work-tab";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { ClickToCall } from "@/features/lead/click-to-call";
import { BookWidget } from "@/features/lead/book-widget";
import { MarksPanel } from "@/features/lead/marks-bar";
import { liveStatus, SHOP_ACTOR, WORK_STATUSES, canDeleteWork } from "@/lib/chrome";
import { accounts, projects } from "@/lib/crm-data";
import { ActBar } from "@/components/act-bar";
import { StatusPill } from "@/components/ui-bits";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";

type KindFilter = "all" | ActionKind;
type TalkLane = "customer" | "internal" | "notes" | "tags" | "actions" | "history" | "media" | "form" | "book" | "details";
type SortKey = "past" | "due" | "newest" | "house" | "owner" | "kind";
type Remembered = { query: string; kind: KindFilter; status: string; sort: SortKey; office: string };

const remembered: Remembered = { query: "", kind: "all", status: "all", sort: "past", office: "all" };

const KINDS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ticket", label: "Tickets" },
  { id: "task", label: "Tasks" },
  { id: "request", label: "Requests" },
];

const STATUS_OPTS: { id: string; label: string }[] = [
  { id: "all", label: "Any" },
  ...WORK_STATUSES.map((s) => ({ id: s, label: s })),
];

const SORT_OPTS: { id: SortKey; label: string }[] = [
  { id: "past", label: "Past due" },
  { id: "due", label: "Due" },
  { id: "newest", label: "Newest" },
  { id: "house", label: "House" },
  { id: "owner", label: "Owner" },
  { id: "kind", label: "Kind" },
];

function CountStrip({
  counts,
  status,
  onStatus,
}: {
  counts: { past: number; soon: number; open: number; complete: number; pause: number; cancel: number };
  status: string;
  onStatus: (v: string) => void;
}) {
  const chips = [
    { id: "Past Due", n: counts.past, label: "Past due", Icon: CircleAlert, ink: "text-stop" },
    { id: "Due Soon", n: counts.soon, label: "Due soon", Icon: Clock, ink: "text-watch" },
    { id: "Open", n: counts.open, label: "Open", Icon: Circle, ink: "text-navy" },
    { id: "Complete", n: counts.complete, label: "Complete", Icon: CircleCheck, ink: "text-go" },
    { id: "Pause", n: counts.pause, label: "Paused", Icon: Pause, ink: "text-muted" },
    { id: "Cancel", n: counts.cancel, label: "Canceled", Icon: Ban, ink: "text-muted" },
  ];
  return (
    <div className="flex w-full gap-1">
      {chips.map((c) => {
        const on = status === c.id;
        const Icon = c.Icon;
        return (
          <Tip key={c.id} label={`${c.n} ${c.label.toLowerCase()}`} on className="min-w-0 flex-1">
            <button
              type="button"
              aria-label={`${c.n} ${c.label}`}
              onClick={() => onStatus(on ? "all" : c.id)}
              className={cn(
                "flex h-10 w-full items-center justify-center gap-1.5 rounded-md border text-[13px] font-semibold",
                on ? "border-navy bg-navy text-card" : "border-line",
              )}
            >
              <Icon className={cn("size-4 shrink-0", on ? "text-card" : c.ink)} />
              <span className="tabular-nums">{c.n}</span>
            </button>
          </Tip>
        );
      })}
    </div>
  );
}

function SelectField({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative block", className)}>
      <select
        {...props}
        className="h-11 w-full appearance-none rounded-md border border-line bg-card py-0 pr-10 pl-3 text-sm outline-none focus:border-navy"
      />
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
    </span>
  );
}

function CatChip({ cat }: { cat?: string }) {
  if (!cat) return null;
  return (
    <span className="inline-flex h-6 shrink-0 items-center rounded-md bg-page px-1.5 text-[11px] font-semibold text-navy">
      {cat}
    </span>
  );
}

function ViewDesc({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <>
      <button
        type="button"
        className={cn(
          "inline-flex h-8 shrink-0 items-center rounded-md px-2 text-[13px] font-semibold text-navy underline decoration-navy/50 underline-offset-[3px]",
          "hover:bg-page hover:decoration-navy",
          open && "bg-page decoration-navy",
        )}
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
      >
        View description
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          <p className="max-w-[24rem] min-w-[16rem] px-3 py-2.5 text-[13px] font-medium leading-6">{text}</p>
        </Float>
      ) : null}
    </>
  );
}

function PersonMark({ label, name }: { label: string; name: string }) {
  if (!name) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <Tip label={name} on>
        <span className="shrink-0" aria-label={`${label} ${name}`}>
          <Initials name={name} />
        </span>
      </Tip>
    </div>
  );
}

function ActionPeople({ owner, assigned, following }: { owner: string; assigned: string; following: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
      <PersonMark label="Owner" name={owner} />
      <PersonMark label="Assigned" name={assigned} />
      <div className="ml-auto flex min-w-0 items-center justify-end gap-1.5">
        <p className="shrink-0 text-[10px] font-bold tracking-wide text-muted uppercase">Following</p>
        {following.length === 0 ? <p className="text-sm text-muted">None</p> : null}
        {following.map((name) => (
          <Tip key={name} label={name} on>
            <span className="shrink-0" aria-label={name}>
              <Initials name={name} />
            </span>
          </Tip>
        ))}
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function dueMs(due?: string) {
  if (!due) return Number.POSITIVE_INFINITY;
  const m = due.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return Number.POSITIVE_INFINITY;
  const month = MONTHS[m[1]];
  if (month == null) return Number.POSITIVE_INFINITY;
  return new Date(new Date().getFullYear(), month, Number(m[2])).getTime();
}

function ageHours(age?: string) {
  if (!age || age === "now") return 0;
  const m = age.match(/^(\d+)\s*h/i);
  if (m) return Number(m[1]);
  const d = age.match(/^(\d+)\s*d/i);
  if (d) return Number(d[1]) * 24;
  return 9999;
}

function compareActions(a: ShopAction, b: ShopAction, sort: SortKey, leads: ReturnType<typeof useOps>["leads"]) {
  if (sort === "past") {
    const rank = (row: ShopAction) => {
      const s = liveStatus(row.status, row.due);
      if (s === "Past Due") return 0;
      if (s === "Due Soon") return 1;
      return 2;
    };
    const ap = rank(a);
    const bp = rank(b);
    if (ap !== bp) return ap - bp;
    return dueMs(a.due) - dueMs(b.due);
  }
  if (sort === "due") return dueMs(a.due) - dueMs(b.due) || a.title.localeCompare(b.title);
  if (sort === "newest") return ageHours(a.age) - ageHours(b.age);
  if (sort === "house") return houseOf(a.personId, leads).name.localeCompare(houseOf(b.personId, leads).name);
  if (sort === "owner") return a.owner.localeCompare(b.owner) || a.title.localeCompare(b.title);
  if (sort === "kind") return ACTION_LABEL[a.kind].localeCompare(ACTION_LABEL[b.kind]) || a.title.localeCompare(b.title);
  return 0;
}

export function ActionQueue({ selectedId }: { selectedId?: string }) {
  const { actions, leads, history } = useOps();
  const { people, viewAs } = useStaff();
  const me = viewAs === "Owner" ? SHOP_ACTOR : viewAs;
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

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <div
        className={cn(
          "relative grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)]",
          editOpen ? "md:grid-cols-[minmax(0,34%)_minmax(0,1fr)_minmax(18rem,32%)]" : "md:grid-cols-[minmax(0,50%)_minmax(0,1fr)]",
        )}
      >
        <div className={cn("flex min-w-0 flex-col overflow-hidden border-b border-r border-line bg-card px-3 py-2.5", mobileTalk && "max-md:hidden")}>
          <div className="flex items-center gap-2">
            <h1 className="shrink-0 text-[20px] font-bold tracking-tight">Actions</h1>
            <MenuPick
              label="Office"
              value={office}
              options={[{ id: "all", label: "All" }, ...OFFICES.map((o) => ({ id: o, label: o }))]}
              onChange={setOffice}
              compact
            />
            <div className="ml-auto">
              <ActBar
                items={[
                  {
                    label: "Create",
                    variant: "navy",
                    menu: [
                      { label: "Ticket", onClick: () => startCreate("ticket") },
                      { label: "Task", onClick: () => startCreate("task") },
                      { label: "Request", onClick: () => startCreate("request") },
                    ],
                  },
                ]}
              />
            </div>
          </div>
          <div className="mt-auto">
            <CountStrip counts={tally} status={status} onStatus={setStatus} />
            <label className="relative mt-2 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, house, owner, id"
                className="h-11 w-full rounded-md border border-line bg-page pr-3 pl-9 text-sm outline-none focus:border-navy"
              />
            </label>
            <div className="mt-2">
              <FilterRow
                kind={kind}
                status={status}
                sort={sort}
                counts={counts}
                onKind={setKind}
                onStatus={setStatus}
                onSort={setSort}
              />
            </div>
          </div>
        </div>

        <div className={cn("flex flex-col bg-card md:col-start-2 md:row-start-1", !mobileTalk && "max-md:hidden")}>
          {active && house ? (
            <>
              <header className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Back to actions"
                    className="grid size-10 shrink-0 place-items-center rounded-md text-navy md:hidden"
                    onClick={() => setMobileTalk(false)}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <a href={house.href} className="flex min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate text-sm font-semibold text-navy">{house.name}</span>
                    <span aria-label="Open house file" className="grid size-9 shrink-0 place-items-center rounded-md text-navy">
                      <SquareArrowOutUpRight className="size-4" />
                    </span>
                  </a>
                  <Tip label="Edit" on className="ml-auto">
                    <button
                      type="button"
                      aria-label="Edit"
                      aria-pressed={editOpen}
                      className={cn("grid size-10 shrink-0 place-items-center rounded-md", editOpen ? "bg-page text-navy" : "text-navy")}
                      onClick={() => setEditOpen((v) => !v)}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </Tip>
                </div>
                <p className="mt-1 flex items-center gap-2">
                  <span className="min-w-0 truncate text-[11px] font-bold tracking-wide text-muted uppercase">
                    {ACTION_LABEL[active.kind]} · {active.id}
                    {parent ? ` · on ${parent.title}` : ""}
                  </span>
                  <CatChip cat={active.category} />
                  {active.description ? <ViewDesc text={active.description} /> : null}
                </p>
                <div className="mt-0.5 min-w-0">
                  <h2 className="text-base font-extrabold break-words">{active.title}</h2>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {house.city ? `${house.city} · ` : ""}
                    {house.pipeline}
                  </p>
                </div>
                <ActionPeople owner={house.owner} assigned={active.owner} following={active.followers ?? []} />
              </header>
              <div className="mt-auto shrink-0 border-t border-line">
                <ConvTabs
                  lane={lane}
                  onLane={(id) => setLane(id as TalkLane)}
                  iconsOnly
                  extra={[{ id: "details", label: "Details", icon: FileText }]}
                  extraClassName={(id) => (id === "details" ? "md:hidden" : undefined)}
                />
              </div>
            </>
          ) : (
            <div className="grid h-full place-items-center px-3 py-3 text-sm text-muted">Pick an action.</div>
          )}
        </div>

        <aside
          className={cn(
            "flex min-h-0 min-w-0 flex-col border-line bg-card md:col-start-1 md:row-start-2 md:border-r",
            mobileTalk && "max-md:hidden",
          )}
        >
          {creating ? (
            <CreateCard
              kind={creating}
              owner={me}
              people={people.map((p) => p.name)}
              leads={leads}
              nestUnder={nestUnderId ? actions.find((a) => a.id === nestUnderId) ?? active : active}
              onDone={onCreated}
              onCancel={() => {
                setCreating(null);
                setNestUnderId(null);
              }}
            />
          ) : null}
          <ul className="min-h-0 flex-1 overflow-auto">
            {rows.map((a) => (
              <li key={a.id} className="border-b border-line">
                <QueueCard
                  action={a}
                  house={houseOf(a.personId, leads)}
                  parent={a.parentId ? actions.find((p) => p.id === a.parentId) : undefined}
                  nested={actions.filter((k) => k.parentId === a.id).length}
                  selected={a.id === active?.id}
                  onOpen={() => open(a.id)}
                  onAdd={(k) => startCreate(k, a.id)}
                />
              </li>
            ))}
            {rows.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No actions in this filter.</li> : null}
          </ul>
        </aside>

        <section className={cn("flex min-h-0 min-w-0 flex-col bg-card md:col-start-2 md:row-start-2", !mobileTalk && "max-md:hidden")}>
          {active && house ? (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">
                {lane === "actions" ? (
                  <WorkTab personId={active.personId} owner={active.owner} parentId={active.id} />
                ) : lane === "history" ? (
                  <div className="h-full overflow-auto p-3">
                    <HistoryList history={history?.[active.personId] ?? []} flush />
                  </div>
                ) : lane === "media" ? (
                  <PhotoRail
                    key={active.id}
                    personId={active.personId}
                    flush
                    actionId={active.id}
                    actionKind={active.kind}
                    actionIds={kidIds}
                    scope={talkScope}
                    onScope={setTalkScope}
                  />
                ) : lane === "tags" ? (
                  house.lead ? (
                    <MarksPanel lead={house.lead} />
                  ) : (
                    <p className="p-3 text-sm text-muted">Tags live on the house file.</p>
                  )
                ) : lane === "form" ? (
                  house.lead ? (
                    <FormAnswers lead={house.lead} />
                  ) : (
                    <p className="p-3 text-sm text-muted">Form lives on the house file.</p>
                  )
                ) : lane === "book" ? (
                  house.lead ? (
                    <div className="h-full overflow-auto p-3">
                      <BookWidget
                        key={active.id}
                        leadId={house.lead.id}
                        defaultCloser={house.lead.closer}
                        defaultKind="Callback"
                        flush
                        actionTitle={active.title}
                      />
                    </div>
                  ) : (
                    <p className="p-3 text-sm text-muted">Book from the house file.</p>
                  )
                ) : lane === "details" ? (
                  <div className="h-full overflow-auto p-3 md:hidden">
                    <DetailRail action={active} house={house} onAdd={(k) => startCreate(k, active.id)} />
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-col overflow-hidden">
                    {callOpen && house.phone ? (
                      <div className="shrink-0 p-2">
                        <ClickToCall
                          personId={active.personId}
                          phone={house.phone}
                          name={house.name}
                          open={callOpen}
                          onClose={() => setCallOpen(false)}
                          actionId={active.id}
                          actionKind={active.kind}
                        />
                      </div>
                    ) : null}
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <ThreadPane
                        personId={active.personId}
                        mode={lane}
                        onCall={
                          house.phone
                            ? () => {
                                if (dndOn(house.lead, "call")) return;
                                setLane("customer");
                                setCallOpen(true);
                              }
                            : undefined
                        }
                        dnd={house.lead?.dnd}
                        actionId={active.id}
                        actionKind={active.kind}
                        actionTitle={active.title}
                        actionIds={kidIds}
                        scope={talkScope}
                        onScope={setTalkScope}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-muted">Pick an action.</div>
          )}
        </section>
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
      </div>
    </div>
  );
}

function DetailRail({ action, house, onAdd }: { action: ShopAction; house: ReturnType<typeof houseOf>; onAdd?: (kind: ActionKind) => void }) {
  const { people, viewAs, ticketCats } = useStaff();
  const status = liveStatus(action.status, action.due);
  const [due, setDue] = useState(action.due ?? "");
  const [description, setDescription] = useState(action.description ?? "");
  const [confirm, setConfirm] = useState(false);
  const word = ACTION_LABEL[action.kind].toLowerCase();
  const navigate = useNavigate();
  const allowDelete = canDeleteWork(viewAs);

  useEffect(() => {
    setDue(action.due ?? "");
    setDescription(action.description ?? "");
  }, [action.id, action.due, action.description]);

  return (
    <div className="space-y-4 p-3">
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">House</p>
        <a href={house.href} className="mt-1 block text-sm font-semibold text-navy">
          {house.name}
        </a>
        <p className="text-[12px] text-muted">
          {house.pipeline}
          {house.city ? ` · ${house.city}` : ""}
        </p>
        {house.phone ? <p className="text-[12px] text-muted">{house.phone}</p> : null}
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Status</p>
        <p className="mt-1">
          <StatusPill label={status} tone={workTone(status)} />
        </p>
        <div className="mt-2">
          <WorkMoves kind={action.kind} id={action.id} status={status} onAdd={onAdd} />
        </div>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Category</p>
        <SelectField
          value={action.category ?? ""}
          onChange={(e) => patchAction(action.id, { category: e.target.value })}
          className="mt-1"
        >
          <option value="">None</option>
          {ticketCats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Due</p>
        <input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          onBlur={() => {
            if (due.trim() === (action.due ?? "")) return;
            patchAction(action.id, { due: due.trim() });
          }}
          placeholder="Sep 18"
          className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Assigned</p>
        <SelectField
          value={action.owner}
          onChange={(e) => patchAction(action.id, { owner: e.target.value })}
          className="mt-1"
        >
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </SelectField>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description.trim() === (action.description ?? "")) return;
            patchAction(action.id, { description: description.trim() });
          }}
          placeholder="What needs to happen."
          rows={4}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </section>
      {allowDelete ? (
        confirm ? (
        <div className="flex flex-col gap-2 text-sm">
          <span>Delete this {word}? Nested work stays on the file.</span>
          <button
            type="button"
            className="h-11 rounded-md bg-stop text-sm font-semibold text-card"
            onClick={() => {
              deleteAction(action.id);
              void navigate({ to: "/tickets" });
            }}
          >
            Delete
          </button>
          <button type="button" className="h-11 text-sm font-semibold text-muted" onClick={() => setConfirm(false)}>
            Keep
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="h-11 w-full rounded-md border border-line text-sm font-semibold text-stop">
          Delete {word}
        </button>
      )
      ) : null}
    </div>
  );
}

function QueueCard({
  action,
  house,
  parent,
  nested,
  selected,
  onOpen,
  onAdd,
}: {
  action: ShopAction;
  house: ReturnType<typeof houseOf>;
  parent?: ShopAction;
  nested: number;
  selected: boolean;
  onOpen: () => void;
  onAdd: (kind: ActionKind) => void;
}) {
  const status = liveStatus(action.status, action.due);
  return (
    <div
      className={cn(
        "border-l-4",
        selected ? "border-l-navy bg-page" : "border-l-transparent hover:bg-page/60",
      )}
    >
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 px-3 pt-3 pb-2 text-left max-md:gap-2.5">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
          {initials(action.owner)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{ACTION_LABEL[action.kind]}</span>
            <CatChip cat={action.category} />
            <StatusPill label={status} tone={workTone(status)} />
          </span>
          <span className="mt-0.5 block text-sm font-semibold text-navy">{action.title}</span>
          {action.description ? (
            <Tip label={action.description} on wide className="mt-0.5 min-w-0 w-full">
              <span className="line-clamp-1 block w-full text-[12px] text-muted">{action.description}</span>
            </Tip>
          ) : null}
          <span className="mt-1 block text-[12px] text-muted">
            {house.name}
            {house.city ? ` · ${house.city}` : ""}
            {parent ? ` · on ${parent.title}` : ""}
          </span>
          <span className="mt-0.5 block text-[11px] text-faint">
            {action.due || "No due"} · {action.owner}
            {action.kind === "ticket" && action.priority === "High" ? " · High" : ""}
            {nested ? ` · ${nested} nested` : ""}
            {` · ${action.id}`}
          </span>
        </span>
      </button>
      <div className="px-3 pb-3 pl-[3.75rem]">
        <WorkMoves kind={action.kind} id={action.id} status={status} onAdd={onAdd} />
      </div>
    </div>
  );
}

function CreateCard({
  kind,
  owner,
  people,
  leads,
  nestUnder,
  onDone,
  onCancel,
}: {
  kind: ActionKind;
  owner: string;
  people: string[];
  leads: ReturnType<typeof useOps>["leads"];
  nestUnder?: ShopAction;
  onDone: (row: ShopAction | undefined) => void;
  onCancel: () => void;
}) {
  const houses = useMemo(() => {
    const live = leads.filter((l) => l.status !== "Dropped" && l.status !== "Merged");
    return [
      ...live.map((l) => ({ id: l.id, label: `${l.name} · Lead · ${l.city}` })),
      ...projects.map((p) => ({ id: p.id, label: `${p.name} · Job` })),
      ...accounts.map((a) => ({ id: a.id, label: `${a.name} · Account` })),
    ];
  }, [leads]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [assignee, setAssignee] = useState(owner);
  const [personId, setPersonId] = useState(nestUnder?.personId ?? houses[0]?.id ?? "");
  const [nest, setNest] = useState(Boolean(nestUnder));
  const { ticketCats } = useStaff();
  const [category, setCategory] = useState(nestUnder?.category ?? ticketCats[0] ?? "");
  const word = nestUnder ? (kind === "task" ? "Subtask" : kind === "request" ? "Subrequest" : ACTION_LABEL[kind]) : ACTION_LABEL[kind];

  return (
    <form
      className="shrink-0 border-b border-line bg-page px-3 py-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !personId) return;
        const row = createAction({
          kind,
          personId: nest && nestUnder ? nestUnder.personId : personId,
          title,
          owner: assignee,
          description,
          due,
          category,
          parentId: nest && nestUnder ? nestUnder.id : undefined,
        });
        onDone(row);
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-bold tracking-wide text-muted uppercase">New {word.toLowerCase()}</p>
        <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`${word} name`}
        className="mt-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What needs to happen."
        rows={2}
        className="mt-2 w-full rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-navy"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          placeholder="Due date"
          className="h-11 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy"
        />
        <SelectField value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          {people.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </SelectField>
      </div>
      <SelectField value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2" aria-label="Category">
        <option value="">No category</option>
        {ticketCats.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </SelectField>
      {nest && nestUnder ? (
        <p className="mt-2 truncate text-[12px] text-muted">
          Nested on {ACTION_LABEL[nestUnder.kind]} · {nestUnder.title}
        </p>
      ) : (
        <SelectField value={personId} onChange={(e) => setPersonId(e.target.value)} className="mt-2">
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </SelectField>
      )}
      {nestUnder ? (
        <label className="mt-2 flex min-h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={nest} onChange={(e) => setNest(e.target.checked)} className="size-4 shrink-0" />
          <span className="min-w-0 truncate">Nest under {nestUnder.title}</span>
        </label>
      ) : null}
      <button type="submit" className="mt-2 h-11 w-full rounded-md bg-navy text-sm font-semibold text-card">
        Save {word.toLowerCase()}
      </button>
    </form>
  );
}

function FilterRow({
  kind,
  status,
  sort,
  counts,
  onKind,
  onStatus,
  onSort,
}: {
  kind: KindFilter;
  status: string;
  sort: SortKey;
  counts: { all: number; ticket: number; task: number; request: number };
  onKind: (v: KindFilter) => void;
  onStatus: (v: string) => void;
  onSort: (v: SortKey) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [icons, setIcons] = useState(true);
  useEffect(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;
    const fit = () => setIcons(measure.scrollWidth > bar.clientWidth + 8);
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    fit();
    return () => ro.disconnect();
  }, [kind, status, sort, counts]);
  return (
    <div className="relative min-w-0">
      <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1 whitespace-nowrap" aria-hidden>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Type {KINDS.find((k) => k.id === kind)?.label}
          <span className="inline-block w-3.5" />
        </span>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Status {STATUS_OPTS.find((s) => s.id === status)?.label}
          <span className="inline-block w-3.5" />
        </span>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Sort {SORT_OPTS.find((s) => s.id === sort)?.label}
          <span className="inline-block w-3.5" />
        </span>
      </div>
      <div ref={barRef} className="flex w-full min-w-0 items-center gap-1 overflow-hidden">
        <MenuPick
          label="Type"
          value={kind}
          options={KINDS.map((k) => ({ ...k, count: counts[k.id] }))}
          onChange={onKind}
          icon={Layers}
          iconsOnly={icons}
        />
        <MenuPick label="Status" value={status} options={STATUS_OPTS} onChange={onStatus} icon={CircleDot} iconsOnly={icons} />
        <MenuPick label="Sort" value={sort} options={SORT_OPTS} onChange={onSort} icon={ArrowUpDown} iconsOnly={icons} />
      </div>
    </div>
  );
}

function MenuPick<T extends string>({
  label,
  value,
  options,
  onChange,
  compact,
  icon: Icon,
  iconsOnly,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; count?: number }[];
  onChange: (v: T) => void;
  compact?: boolean;
  icon?: typeof Layers;
  iconsOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = options.find((o) => o.id === value)?.label ?? options[0]?.label ?? label;
  const hot = value !== options[0]?.id;
  return (
    <>
      <Tip label={`${label} · ${current}`} on={Boolean(iconsOnly)} className={iconsOnly ? "min-w-0 flex-1" : undefined}>
        <button
          type="button"
          aria-label={`${label}: ${current}`}
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex min-w-0 items-center rounded-md font-semibold",
            iconsOnly
              ? "h-11 w-full justify-center"
              : compact
                ? "h-9 shrink-0 gap-1.5 px-2.5 text-[12px]"
                : "h-11 min-w-0 gap-1.5 px-3 text-[13px]",
            hot ? "bg-navy text-card" : "border border-line bg-card text-muted hover:text-ink",
          )}
        >
          {iconsOnly && Icon ? (
            <Icon className="size-4" />
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-1.5">
                <span className={hot ? "text-card/80" : "text-muted"}>{label}</span>
                <span className="truncate">{current}</span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 opacity-70" />
            </>
          )}
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="flex h-10 w-full min-w-44 items-center justify-between gap-2 px-3 text-left text-sm hover:bg-page"
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
            >
              <span>{o.label}</span>
              <span className="flex items-center gap-2">
                {o.count != null ? <span className="text-[11px] text-muted">{o.count}</span> : null}
                {o.id === value ? <span className="text-[11px] font-bold text-navy">On</span> : null}
              </span>
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}
