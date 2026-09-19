import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, FileText, Search, SquareArrowOutUpRight } from "lucide-react";
import { ACTION_LABEL, workTone, type ActionKind, type ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import {
  createAction,
  deleteAction,
  descendantsOf,
  dndOn,
  patchAction,
  setWorkStatus,
  useOps,
} from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { ConvTabs } from "@/features/record-shell/conv-tabs";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { WorkTab } from "@/features/record-shell/work-tab";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { ClickToCall } from "@/features/lead/click-to-call";
import { BookWidget } from "@/features/lead/book-widget";
import { MarksPanel } from "@/features/lead/marks-bar";
import { liveStatus, SHOP_ACTOR, WORK_STATUSES } from "@/lib/chrome";
import { accounts, projects } from "@/lib/crm-data";
import { ActBar } from "@/components/act-bar";
import { StatusPill } from "@/components/ui-bits";
import { Float } from "@/components/float";
import { cn } from "@/lib/cn";

type KindFilter = "all" | ActionKind;
type TalkLane = "customer" | "internal" | "notes" | "tags" | "actions" | "history" | "media" | "form" | "book" | "details";
type SortKey = "past" | "due" | "newest" | "house" | "owner" | "kind";
type Remembered = { query: string; kind: KindFilter; status: string; sort: SortKey };

const remembered: Remembered = { query: "", kind: "all", status: "all", sort: "past" };

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
    const ap = liveStatus(a.status, a.due) === "Past Due" ? 0 : 1;
    const bp = liveStatus(b.status, b.due) === "Past Due" ? 0 : 1;
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
  const [activeId, setActiveId] = useState(selectedId ?? actions[0]?.id ?? "");
  const [lane, setLane] = useState<TalkLane>("internal");
  const [talkScope, setTalkScope] = useState<"action" | "house">("action");
  const [mobileTalk, setMobileTalk] = useState(Boolean(selectedId));
  const [creating, setCreating] = useState<ActionKind | null>(null);
  const [callOpen, setCallOpen] = useState(false);

  useEffect(() => {
    remembered.query = query;
    remembered.kind = kind;
    remembered.status = status;
    remembered.sort = sort;
  }, [query, kind, status, sort]);

  useEffect(() => {
    if (selectedId) {
      setActiveId(selectedId);
      setTalkScope("action");
      setLane("internal");
      setCallOpen(false);
    }
  }, [selectedId]);

  const counts = useMemo(
    () => ({
      all: actions.length,
      ticket: actions.filter((a) => a.kind === "ticket").length,
      task: actions.filter((a) => a.kind === "task").length,
      request: actions.filter((a) => a.kind === "request").length,
    }),
    [actions],
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = actions.filter((a) => {
      if (kind !== "all" && a.kind !== kind) return false;
      if (status !== "all" && liveStatus(a.status, a.due) !== status) return false;
      if (!needle) return true;
      const house = houseOf(a.personId, leads);
      return [a.title, a.id, a.owner, a.kind, a.description, house.name, house.id, house.city]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
    return [...filtered].sort((a, b) => compareActions(a, b, sort, leads));
  }, [actions, kind, status, sort, query, leads]);

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
    if (row) open(row.id);
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <div className="flex min-h-0 min-w-0 flex-1">
        <aside
          className={cn(
            "flex w-full min-w-0 shrink-0 flex-col border-r border-line bg-card md:w-[58%] xl:w-[50%]",
            mobileTalk && "max-md:hidden",
          )}
        >
          <div className="shrink-0 border-b border-line px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-[20px] font-bold tracking-tight">Actions</h1>
              <ActBar
                items={[
                  {
                    label: "Create",
                    variant: "navy",
                    menu: [
                      { label: "Ticket", onClick: () => setCreating("ticket") },
                      { label: "Task", onClick: () => setCreating("task") },
                      { label: "Request", onClick: () => setCreating("request") },
                    ],
                  },
                ]}
              />
            </div>
            <label className="relative mt-3 block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Title, house, owner, id"
                className="h-11 w-full rounded-md border border-line bg-page pr-3 pl-9 text-sm outline-none focus:border-navy"
              />
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-1 md:flex-nowrap">
              <MenuPick
                label="Type"
                value={kind}
                options={KINDS.map((k) => ({ ...k, count: counts[k.id] }))}
                onChange={setKind}
              />
              <MenuPick label="Status" value={status} options={STATUS_OPTS} onChange={setStatus} />
              <MenuPick label="Sort" value={sort} options={SORT_OPTS} onChange={setSort} />
            </div>
          </div>
          {creating ? (
            <CreateCard
              kind={creating}
              owner={me}
              people={people.map((p) => p.name)}
              leads={leads}
              nestUnder={active}
              onDone={onCreated}
              onCancel={() => setCreating(null)}
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
                />
              </li>
            ))}
            {rows.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No actions in this filter.</li> : null}
          </ul>
        </aside>

        <section className={cn("flex min-h-0 min-w-0 flex-1 flex-col bg-card", !mobileTalk && "max-md:hidden")}>
          {active && house ? (
            <>
              <header className="shrink-0 border-b border-line px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Back to actions"
                    className="grid size-10 shrink-0 place-items-center rounded-md text-navy md:hidden"
                    onClick={() => setMobileTalk(false)}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <p className="min-w-0 flex-1 truncate text-[11px] font-bold tracking-wide text-muted uppercase max-md:hidden">
                    {ACTION_LABEL[active.kind]} · {active.id}
                    {parent ? ` · on ${parent.title}` : ""}
                  </p>
                  <a
                    href={house.href}
                    className="ml-auto flex min-w-0 max-w-[14rem] shrink-0 items-center gap-2 max-md:ml-0 max-md:max-w-none max-md:flex-1"
                  >
                    <span className="min-w-0 truncate text-sm font-semibold text-navy">{house.name}</span>
                    <span
                      aria-label="Open house file"
                      className="grid size-10 shrink-0 place-items-center rounded-md border border-line text-navy"
                    >
                      <SquareArrowOutUpRight className="size-4" />
                    </span>
                  </a>
                </div>
                <p className="mt-1 truncate text-[11px] font-bold tracking-wide text-muted uppercase md:hidden">
                  {ACTION_LABEL[active.kind]} · {active.id}
                  {parent ? ` · on ${parent.title}` : ""}
                </p>
                <div className="mt-0.5 min-w-0">
                  <h2 className="text-base font-extrabold break-words">{active.title}</h2>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {house.city ? `${house.city} · ` : ""}
                    {house.pipeline}
                  </p>
                </div>
              </header>
              <ConvTabs
                lane={lane}
                onLane={(id) => setLane(id as TalkLane)}
                iconsOnly
                extra={[{ id: "details", label: "Details", icon: FileText }]}
                extraClassName={(id) => (id === "details" ? "xl:hidden" : undefined)}
              />
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
                  <div className="h-full overflow-auto p-3 xl:hidden">
                    <DetailRail action={active} house={house} />
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
        {active && house ? (
          <aside className="hidden min-h-0 w-[240px] shrink-0 flex-col overflow-auto border-l border-line bg-card xl:flex">
            <DetailRail action={active} house={house} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function DetailRail({ action, house }: { action: ShopAction; house: ReturnType<typeof houseOf> }) {
  const { people } = useStaff();
  const status = liveStatus(action.status, action.due);
  const [due, setDue] = useState(action.due ?? "");
  const [description, setDescription] = useState(action.description ?? "");
  const [confirm, setConfirm] = useState(false);
  const word = ACTION_LABEL[action.kind].toLowerCase();
  const navigate = useNavigate();

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
        <div className="mt-2 flex flex-wrap gap-1">
          {WORK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setWorkStatus(action.kind, action.id, s)}
              className={cn(
                "h-8 rounded-md px-2 text-[11px] font-semibold",
                status === s ? "bg-navy text-card" : "border border-line text-muted",
              )}
            >
              {s}
            </button>
          ))}
        </div>
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
        <select
          value={action.owner}
          onChange={(e) => patchAction(action.id, { owner: e.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
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
      {confirm ? (
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
      )}
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
}: {
  action: ShopAction;
  house: ReturnType<typeof houseOf>;
  parent?: ShopAction;
  nested: number;
  selected: boolean;
  onOpen: () => void;
}) {
  const status = liveStatus(action.status, action.due);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-start gap-3 border-l-4 px-3 py-3 text-left max-md:gap-2.5 max-md:px-3 max-md:py-2.5",
        selected ? "border-l-navy bg-page" : "border-l-transparent hover:bg-page/60",
      )}
    >
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
        {initials(action.owner)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">{ACTION_LABEL[action.kind]}</span>
          <StatusPill label={status} tone={workTone(status)} />
        </span>
        <span className="mt-0.5 block text-sm font-semibold text-navy">{action.title}</span>
        {action.description ? <span className="mt-0.5 line-clamp-2 block text-[12px] text-muted">{action.description}</span> : null}
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
  const word = ACTION_LABEL[kind];

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
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="h-11 rounded-md border border-line bg-card px-3 text-sm"
        >
          {people.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      {nest && nestUnder ? (
        <p className="mt-2 truncate text-[12px] text-muted">
          Nested on {ACTION_LABEL[nestUnder.kind]} · {nestUnder.title}
        </p>
      ) : (
        <select
          value={personId}
          onChange={(e) => setPersonId(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {houses.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
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

function MenuPick<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string; count?: number }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = options.find((o) => o.id === value)?.label ?? options[0]?.label ?? label;
  const hot = value !== options[0]?.id;
  return (
    <>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
        className={cn(
          "inline-flex h-11 min-w-0 items-center gap-1.5 rounded-md px-3 text-[13px] font-semibold",
          "max-md:flex-1 max-md:justify-between max-md:px-2.5 md:shrink-0",
          hot ? "bg-navy text-card" : "border border-line bg-card text-muted hover:text-ink",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn("max-md:hidden", hot ? "text-card/80" : "text-muted")}>{label}</span>
          <span className="truncate">{current}</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </button>
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
