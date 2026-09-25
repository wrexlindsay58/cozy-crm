import { useMemo, useState } from "react";
import {
  BellOff,
  Ban,
  Calendar,
  ChevronDown,
  ChevronLeft,
  GitBranch,
  Inbox,
  Layers,
  ListFilter,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  Search,
  Smartphone,
  SquareArrowOutUpRight,
  Star,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { accounts, byId } from "@/lib/crm-data";
import { actingName } from "@/features/staff/store";
import { pipelineOf } from "@/lib/pipeline-of";
import { stageWash, toneForStatus, LEAD_STATUSES } from "@/lib/lead-status";
import { ClickToCall } from "@/features/lead/click-to-call";
import { DndPick } from "@/features/lead/dnd-pick";
import { MarksPanel } from "@/features/lead/marks-bar";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps, dndOn, addHistory } from "@/features/ops/store";
import { setCallFrom, setSmsFrom, useFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { useStaff } from "@/features/staff/store";
import { useAssessments } from "@/features/assessment/store";
import { blockAndDelete, blockContacts, isBlocked, isHidden, isRead, isStarred, markRead, toggleStar, unblockContacts, useMessages } from "@/features/thread/store";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { type ConvLane } from "@/features/record-shell/lanes";
import { ConvTabs } from "@/features/record-shell/conv-tabs";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { WorkTab } from "@/features/record-shell/work-tab";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { PageTitle } from "@/components/ui-bits";

const WHO = [
  { id: "all", label: "All contacts", face: "All", icon: Users },
  { id: "mine", label: "Assigned to me", face: "Mine", icon: User },
  { id: "following", label: "Followed by me", face: "Follow", icon: UserPlus },
] as const;

const CHANNEL = [
  { id: "all", label: "All talk", face: "Talk", icon: MessagesSquare },
  { id: "sms", label: "SMS", face: "SMS", icon: Smartphone },
  { id: "call", label: "Phone", face: "Phone", icon: Phone },
  { id: "email", label: "Email", face: "Email", icon: Mail },
] as const;

const TYPE = [
  { id: "all", label: "All types", face: "Type", icon: Layers },
  { id: "customer", label: "Customer", face: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", face: "Internal", icon: Users },
] as const;

const PIPE = [
  { id: "all", label: "All pipelines", face: "Pipe", icon: GitBranch },
  { id: "Lead", label: "Lead", face: "Lead", icon: GitBranch },
  { id: "Assessment", label: "Assessment", face: "Assess", icon: GitBranch },
  { id: "Opportunity", label: "Opportunity", face: "Opp", icon: GitBranch },
  { id: "Job", label: "Job", face: "Job", icon: GitBranch },
  { id: "Account", label: "Account", face: "Account", icon: GitBranch },
] as const;

type Lane = ConvLane;
type Who = (typeof WHO)[number]["id"];
type Channel = (typeof CHANNEL)[number]["id"];
type TalkType = (typeof TYPE)[number]["id"];
type Pipe = (typeof PIPE)[number]["id"];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function unreadCount(msgs: { from: string; channel: string }[], personId: string) {
  if (isRead(personId)) return 0;
  let n = 0;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.from !== "customer") break;
    if (m.channel === "sms" || m.channel === "email" || m.channel === "call") n += 1;
  }
  return n;
}

export function Conversations() {
  const messages = useMessages();
  const { leads, followers, history, appointments, tickets } = useOps();
  const { viewAs, actorName: me } = useStaff();
  useAssessments();
  const [who, setWho] = useState<Who>("all");
  const [channel, setChannel] = useState<Channel>("all");
  const [talkType, setTalkType] = useState<TalkType>("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pipe, setPipe] = useState<Pipe>("all");
  const [extra, setExtra] = useState({ dnd: false, booked: false, actions: false, status: "" });
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("L-4821");
  const [lane, setLane] = useState<Lane>("customer");
  const [mobileThread, setMobileThread] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const people = useMemo(() => {
    const byIdMap = new Map<string, { id: string; name: string; phone: string; city: string; closer: string; setter: string; leadId?: string }>();
    for (const l of leads) {
      byIdMap.set(l.id, {
        id: l.id,
        name: l.name,
        phone: l.phone,
        city: l.city,
        closer: l.closer,
        setter: l.setter,
        leadId: l.id,
      });
    }
    for (const a of accounts) {
      if ([...byIdMap.values()].some((p) => p.name === a.name)) continue;
      const lead = leads.find((l) => l.name === a.name);
      byIdMap.set(a.id, {
        id: lead?.id ?? a.id,
        name: a.name,
        phone: lead?.phone ?? "",
        city: a.city,
        closer: a.owner,
        setter: lead?.setter ?? "",
        leadId: lead?.id,
      });
    }
    return [...byIdMap.values()];
  }, [leads]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .map((p) => {
        const acc = accounts.find((a) => a.name === p.name);
        const lead = byId(leads, p.leadId ?? p.id);
        const msgs = messages.filter(
          (m) => m.personId === p.id || m.personId === p.leadId || (acc && m.personId === acc.id),
        );
        const last = msgs.at(-1);
        const follow = followers[p.id] ?? followers[p.leadId ?? ""] ?? [];
        const assigned = p.closer === me || p.setter === me;
        const following = follow.some((f) => f.name === me);
        const unread = unreadCount(msgs, p.id);
        const pipe = pipelineOf(p.leadId ?? p.id, p.name);
        const appt = appointments.find((a) => a.leadId === (p.leadId ?? p.id));
        const starred = isStarred(p.id) || isStarred(p.leadId ?? "");
        const dndOnFlag = Boolean(lead?.dnd?.length);
        const ids = [p.id, p.leadId ?? "", acc?.id ?? ""].filter(Boolean);
        const blocked = ids.some((id) => isBlocked(id));
        const hidden = ids.some((id) => isHidden(id));
        return {
          ...p,
          msgs,
          last,
          assigned,
          following,
          unread,
          pipe,
          appt,
          starred,
          dndOn: dndOnFlag,
          blocked,
          hidden,
          status: lead?.status ?? "",
          tone: lead?.tone ?? toneForStatus(lead?.status ?? ""),
          openActions: tickets.some((tix) => (tix.related === p.id || tix.related === p.leadId) && tix.status !== "Complete" && tix.status !== "Cancel"),
        };
      })
      .filter((p) => {
        if (p.hidden) return false;
        if (who === "mine" && !p.assigned) return false;
        if (who === "following" && !p.following) return false;
        if (starredOnly && !p.starred) return false;
        if (unreadOnly && !p.unread) return false;
        if (pipe !== "all" && p.pipe.label !== pipe) return false;
        if (extra.dnd && !p.dndOn) return false;
        if (extra.booked && !p.appt) return false;
        if (extra.actions && !p.openActions) return false;
        if (extra.status && p.status !== extra.status) return false;
        if (talkType === "customer" && !p.msgs.some((m) => m.channel === "sms" || m.channel === "call" || m.channel === "email")) return false;
        if (talkType === "internal" && !p.msgs.some((m) => m.channel === "internal")) return false;
        if (channel === "sms" && !p.msgs.some((m) => m.channel === "sms")) return false;
        if (channel === "call" && !p.msgs.some((m) => m.channel === "call")) return false;
        if (channel === "email" && !p.msgs.some((m) => m.channel === "email")) return false;
        if (!q) return true;
        return [p.name, p.phone, p.last?.text, p.pipe.label, p.status].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        if (Boolean(a.unread) !== Boolean(b.unread)) return a.unread ? -1 : 1;
        return Number(Boolean(b.last)) - Number(Boolean(a.last));
      });
  }, [people, messages, followers, me, who, channel, talkType, starredOnly, unreadOnly, pipe, extra, query, appointments, leads, tickets]);

  const active = rows.find((r) => r.id === activeId) ?? rows[0];
  const lead = active ? byId(leads, active.leadId ?? active.id) : undefined;
  const personId = active?.leadId ?? active?.id ?? "";
  const acc = active ? accounts.find((a) => a.name === active.name) : undefined;
  const onAcc = acc ? messages.filter((m) => m.personId === acc.id).length : 0;
  const onLead = messages.filter((m) => m.personId === personId).length;
  const threadId = onAcc > onLead && acc ? acc.id : personId;
  const starred = active ? isStarred(active.id) || isStarred(personId) : false;

  function openRow(id: string) {
    setActiveId(id);
    setMobileThread(true);
    setCallOpen(false);
    markRead(id);
  }

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="shrink-0 border-b border-line bg-card px-4">
        <PageTitle title="Inbox" flush />
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className={cn("flex w-full shrink-0 flex-col border-r border-line bg-card @container md:w-[clamp(18rem,34%,40rem)]", mobileThread && "max-md:hidden")}>
          <div className="border-b border-line px-2 py-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or number"
                className="h-10 w-full rounded-md border border-line bg-card pr-3 pl-9 text-sm outline-none"
              />
            </label>
            <div className="mt-1.5 flex w-full items-center gap-0.5">
              <Pick items={WHO} value={who} onChange={setWho} />
              <IconChip
                label="Starred"
                face="Star"
                icon={Star}
                on={starredOnly}
                filled={starredOnly}
                onClick={() => setStarredOnly((v) => !v)}
              />
              <IconChip
                label="Unread"
                face="New"
                icon={Inbox}
                on={unreadOnly}
                onClick={() => setUnreadOnly((v) => !v)}
              />
              <span className="h-4 w-px shrink-0 bg-line" />
              <Pick items={CHANNEL} value={channel} onChange={setChannel} />
              <Pick items={TYPE} value={talkType} onChange={setTalkType} />
              <Pick items={PIPE} value={pipe} onChange={setPipe} />
              <ExtraPick value={extra} onChange={setExtra} />
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {rows.map((t) => {
              const on = t.id === active?.id;
              return (
                <li key={t.id} className={cn("border-b border-line", on && "bg-page")}>
                  <div className={cn("flex items-start gap-2 border-l-4 px-2 py-2.5", on ? "border-l-navy" : "border-l-transparent")}>
                    <button
                      type="button"
                      aria-label={t.starred ? "Unstar" : "Star"}
                      className="mt-2 grid size-8 shrink-0 place-items-center text-muted"
                      onClick={() => toggleStar(t.id)}
                    >
                      <Star className={cn("size-3.5", t.starred && "fill-navy text-navy")} />
                    </button>
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openRow(t.id)}>
                      <span className="flex items-center gap-2">
                        <span className="relative grid size-9 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card">
                          {initials(t.name)}
                          {t.unread ? (
                            <i className="absolute -top-1 -right-1 grid min-w-4 place-items-center rounded-full bg-alert px-1 text-[9px] font-bold text-card">
                              {t.unread}
                            </i>
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className={cn("type-group truncate", t.unread && "font-bold")}>{t.name}</span>
                            {t.blocked ? <Ban className="size-3 shrink-0 text-stop" /> : null}
                            {t.dndOn ? <BellOff className="size-3 shrink-0 text-alert" /> : null}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] text-faint">{t.last?.at ?? ""}</span>
                      </span>
                      <span className="type-meta mt-1 flex items-center gap-1">
                        {t.last?.channel === "call" ? <Phone className="size-3" /> : t.last?.channel === "email" ? <Mail className="size-3" /> : t.last?.channel === "internal" ? <Users className="size-3" /> : <MessageSquare className="size-3" />}
                        <span className="truncate">{t.last?.text ?? "No talk yet"}</span>
                      </span>
                      {t.appt ? (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-navy">
                          <Calendar className="size-3" />
                          Sep {t.appt.day} {t.appt.time}
                        </span>
                      ) : null}
                    </button>
                    <a
                      href={t.pipe.href}
                      aria-label="Open file"
                      className="mt-2 grid size-8 shrink-0 place-items-center rounded-md text-muted hover:bg-page hover:text-navy"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SquareArrowOutUpRight className="size-3.5" />
                    </a>
                  </div>
                </li>
              );
            })}
            {rows.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No contacts.</li> : null}
          </ul>
        </aside>

        <section className={cn("flex min-w-0 flex-1 flex-col bg-card", !mobileThread && "max-md:hidden")}>
          {active ? (
            <>
              <header className="border-b border-line px-3 py-2 md:hidden">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Back to inbox"
                    className="grid size-10 shrink-0 place-items-center rounded-md text-navy"
                    onClick={() => setMobileThread(false)}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="type-section min-w-0 truncate">{active.name}</h2>
                    <Tip label="Open file" on>
                      <a
                        href={active.pipe.href}
                        aria-label="Open file"
                        className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-navy"
                      >
                        <SquareArrowOutUpRight className="size-4" />
                      </a>
                    </Tip>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2 overflow-x-auto">
                  {active.status ? (
                    <span className={cn("h-7 shrink-0 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase leading-7", stageWash(active.tone))}>
                      {active.status}
                    </span>
                  ) : null}
                  <span className="h-7 shrink-0 rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase leading-7">
                    {active.pipe.label}
                  </span>
                  {lead ? <DndPick lead={lead} compact /> : null}
                  <PhoneSplit disabled={dndOn(lead, "call") || !active.phone} onCall={() => setCallOpen(true)} />
                  <Tip label="Book" on>
                    <button type="button" aria-label="Book" className="grid size-9 shrink-0 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                      <Calendar className="size-4" />
                    </button>
                  </Tip>
                  <Tip label={starred ? "Unstar" : "Star"} on>
                    <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-9 shrink-0 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                      <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                    </button>
                  </Tip>
                  <BlockMenu name={active.name} ids={[active.id, personId, acc?.id ?? ""]} />
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {active.phone}
                  {active.city ? ` · ${active.city}` : ""}
                  {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
                </p>
              </header>
              <header className="hidden min-h-14 items-center gap-3 border-b border-line px-3 py-2 md:flex">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h2 className="type-section min-w-0 truncate">{active.name}</h2>
                    <Tip label="Open file" on>
                      <a href={active.pipe.href} aria-label="Open file" className="grid size-9 shrink-0 place-items-center rounded-md border border-line text-navy">
                        <SquareArrowOutUpRight className="size-4" />
                      </a>
                    </Tip>
                    {active.status ? (
                      <span className={cn("h-7 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase leading-7", stageWash(active.tone))}>
                        {active.status}
                      </span>
                    ) : null}
                    <span className="h-7 rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase leading-7">
                      {active.pipe.label}
                    </span>
                    {lead ? <DndPick lead={lead} compact /> : null}
                  </div>
                  <p className="text-[11px] text-muted">
                    {active.phone}
                    {active.city ? ` · ${active.city}` : ""}
                    {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
                  </p>
                </div>
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <PhoneSplit disabled={dndOn(lead, "call") || !active.phone} onCall={() => setCallOpen(true)} />
                  <Tip label="Book" on>
                    <button type="button" aria-label="Book" className="grid size-9 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                      <Calendar className="size-4" />
                    </button>
                  </Tip>
                  <Tip label={starred ? "Unstar" : "Star"} on>
                    <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-9 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                      <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                    </button>
                  </Tip>
                  <BlockMenu name={active.name} ids={[active.id, personId, acc?.id ?? ""]} />
                </div>
              </header>
              <LaneHead lane={lane} onLane={setLane} />
              <div className="min-h-0 flex-1 overflow-hidden">
                {callOpen && active.phone ? (
                  <div className="p-2">
                    <ClickToCall personId={threadId} phone={active.phone} name={active.name} open={callOpen} onClose={() => setCallOpen(false)} />
                  </div>
                ) : null}
                {lane === "actions" ? (
                  <WorkTab personId={personId} owner={me} />
                ) : lane === "tags" ? (
                  lead ? <MarksPanel lead={lead} /> : <p className="p-3 text-sm text-muted">No file.</p>
                ) : lane === "history" ? (
                  <div className="h-full overflow-auto p-3">
                    <HistoryList history={history?.[threadId] ?? history?.[personId] ?? []} flush />
                  </div>
                ) : lane === "media" ? (
                  <div className="h-full overflow-auto">
                    <PhotoRail personId={threadId} flush />
                  </div>
                ) : lane === "form" ? (
                  lead ? <FormAnswers lead={lead} /> : <p className="p-3 text-sm text-muted">No form.</p>
                ) : lane === "book" ? (
                  <div className="overflow-auto p-3">
                    <BookWidget leadId={personId} defaultCloser={active.closer} defaultKind="Sales" flush />
                  </div>
                ) : (
                  <ThreadPane
                    personId={threadId}
                    mode={lane as "customer" | "internal" | "notes"}
                    onCall={() => setCallOpen(true)}
                    dnd={lead?.dnd}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-muted">Pick a contact.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function BlockMenu({ name, ids }: { name: string; ids: string[] }) {
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

function PhoneSplit({ onCall, disabled }: { onCall: () => void; disabled?: boolean }) {
  const { numbers } = useMoneySettings();
  const { callFrom } = useFrom();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  return (
    <div className={cn("inline-flex h-9 overflow-hidden rounded-md border border-line bg-card", disabled && "opacity-40")}>
      <Tip label="Call" on>
        <button type="button" aria-label="Call" disabled={disabled} className="grid w-9 place-items-center disabled:cursor-not-allowed" onClick={onCall}>
          <Phone className="size-4" />
        </button>
      </Tip>
      <span className="w-px self-stretch bg-line" />
      <button
        type="button"
        aria-label="Call from"
        disabled={disabled}
        className="grid w-7 place-items-center disabled:cursor-not-allowed"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setOpen((v) => !v);
        }}
      >
        <ChevronDown className="size-3.5 opacity-80" />
      </button>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {numbers.map((n) => (
            <button
              key={n.number}
              type="button"
              className={cn("block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page", n.number === callFrom && "font-semibold")}
              onClick={() => {
                setCallFrom(n.number);
                setSmsFrom(n.number);
                setOpen(false);
              }}
            >
              {n.office} · {n.number}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}

function Pick<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly { id: T; label: string; face?: string; icon: typeof Star }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const current = items.find((i) => i.id === value) ?? items[0];
  const Icon = current.icon;
  const hot = value !== items[0].id;
  return (
    <>
      <Tip label={current.label} on side="bottom" className="min-w-0 flex-1">
        <button
          type="button"
          aria-label={current.label}
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1",
            hot ? "bg-navy text-card" : "text-muted hover:bg-page",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">{current.face ?? current.label}</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" />
        </button>
      </Tip>
      {open && anchor ? (
        <Float
          anchor={anchor}
          prefer="bottom"
          onClose={() => setOpen(false)}
        >
          {items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="flex h-10 w-full min-w-44 items-center gap-2 px-3 text-left text-sm hover:bg-page"
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <ItemIcon className="size-3.5" />
                <span className="flex-1">{item.label}</span>
                {item.id === value ? <span className="text-[11px] font-bold text-navy">On</span> : null}
              </button>
            );
          })}
        </Float>
      ) : null}
    </>
  );
}

type Extra = { dnd: boolean; booked: boolean; actions: boolean; status: string };

function ExtraPick({ value, onChange }: { value: Extra; onChange: (v: Extra) => void }) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const hot = value.dnd || value.booked || value.actions || Boolean(value.status);
  const rows: { key: keyof Extra; label: string; on: boolean }[] = [
    { key: "dnd", label: "DND on", on: value.dnd },
    { key: "booked", label: "Has a book", on: value.booked },
    { key: "actions", label: "Open actions", on: value.actions },
  ];
  return (
    <>
      <Tip label="Filters" on side="bottom" className="min-w-0 flex-1">
        <button
          type="button"
          aria-label="Filters"
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn("inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1", hot ? "bg-navy text-card" : "text-muted hover:bg-page")}
        >
          <ListFilter className="size-3.5 shrink-0" />
          <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">More</span>
          <ChevronDown className="size-3 shrink-0 opacity-70" />
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              className="flex h-10 w-full min-w-48 items-center justify-between gap-2 px-3 text-sm hover:bg-page"
              onClick={() => onChange({ ...value, [row.key]: !value[row.key] })}
            >
              <span>{row.label}</span>
              <span className={cn("text-[11px] font-bold", row.on ? "text-navy" : "text-muted")}>{row.on ? "On" : "Off"}</span>
            </button>
          ))}
          <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wide text-muted uppercase">Status</p>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between px-3 text-sm hover:bg-page"
            onClick={() => onChange({ ...value, status: "" })}
          >
            Any
            {!value.status ? <span className="text-[11px] font-bold text-navy">On</span> : null}
          </button>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s.label}
              type="button"
              className="flex h-10 w-full items-center justify-between px-3 text-sm hover:bg-page"
              onClick={() => onChange({ ...value, status: value.status === s.label ? "" : s.label })}
            >
              {s.label}
              {value.status === s.label ? <span className="text-[11px] font-bold text-navy">On</span> : null}
            </button>
          ))}
        </Float>
      ) : null}
    </>
  );
}

function IconChip({
  label,
  face,
  icon: Icon,
  on,
  onClick,
  filled,
}: {
  label: string;
  face?: string;
  icon: typeof Star;
  on: boolean;
  onClick: () => void;
  filled?: boolean;
}) {
  return (
    <Tip label={label} on side="bottom" className="min-w-0 flex-1">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn("inline-flex h-8 w-full min-w-0 items-center justify-center gap-1 rounded-md px-1", on ? "bg-navy text-card" : "text-muted hover:bg-page")}
      >
        <Icon className={cn("size-3.5 shrink-0", filled && "fill-current")} />
        <span className="hidden min-w-0 truncate text-[11px] font-semibold @min-[30rem]:inline">{face ?? label}</span>
      </button>
    </Tip>
  );
}

function LaneHead({ lane, onLane }: { lane: Lane; onLane: (v: Lane) => void }) {
  return <ConvTabs lane={lane} onLane={(id) => onLane(id as Lane)} />;
}
