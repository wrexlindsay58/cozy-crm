import { useMemo, useState } from "react";
import {
  BellOff,
  Calendar,
  ClipboardList,
  Clock,
  Image,
  Inbox,
  ListChecks,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  Search,
  Smartphone,
  SquareArrowOutUpRight,
  Star,
  StickyNote,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { accounts, byId } from "@/lib/crm-data";
import { SHOP_ACTOR } from "@/lib/chrome";
import { pipelineOf } from "@/lib/pipeline-of";
import { stageWash, toneForStatus } from "@/lib/lead-status";
import { ClickToCall } from "@/features/lead/click-to-call";
import { DndPick } from "@/features/lead/dnd-pick";
import { BookWidget } from "@/features/lead/book-widget";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { useAssessments } from "@/features/assessment/store";
import { isRead, isStarred, markRead, toggleStar, useMessages } from "@/features/thread/store";
import { HistoryList, PhotoRail } from "@/features/record-shell/side-rails";
import { FormAnswers } from "@/features/record-shell/form-answers";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { WorkTab } from "@/features/record-shell/work-tab";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";
import { PageTitle } from "@/components/ui-bits";

const WHO = [
  { id: "all", label: "All contacts", icon: Users },
  { id: "mine", label: "Assigned to me", icon: User },
  { id: "following", label: "Following", icon: UserPlus },
  { id: "starred", label: "Starred", icon: Star },
] as const;

const KIND = [
  { id: "all", label: "All talk", icon: MessagesSquare },
  { id: "unread", label: "Unread", icon: Inbox },
  { id: "customer", label: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", icon: Users },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "call", label: "Calls", icon: Phone },
  { id: "email", label: "Email", icon: Mail },
  { id: "dnd", label: "DND on", icon: BellOff },
] as const;

const LANES = [
  { id: "customer", label: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", icon: Users },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "actions", label: "Actions", icon: ListChecks },
  { id: "history", label: "History", icon: Clock },
  { id: "media", label: "Media", icon: Image },
  { id: "form", label: "Form", icon: ClipboardList },
  { id: "book", label: "Book", icon: Calendar },
] as const;

type Lane = (typeof LANES)[number]["id"];
type Who = (typeof WHO)[number]["id"];
type Kind = (typeof KIND)[number]["id"];

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
  const { leads, followers, history, appointments } = useOps();
  const { viewAs } = useStaff();
  useAssessments();
  const me = viewAs === "Owner" ? SHOP_ACTOR : viewAs;
  const [who, setWho] = useState<Who>("all");
  const [kind, setKind] = useState<Kind>("all");
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
        const dndOn = Boolean(lead?.dnd?.length);
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
          dndOn,
          status: lead?.status ?? "",
          tone: lead?.tone ?? toneForStatus(lead?.status ?? ""),
        };
      })
      .filter((p) => {
        if (who === "mine" && !p.assigned) return false;
        if (who === "following" && !p.following) return false;
        if (who === "starred" && !p.starred) return false;
        if (kind === "unread" && !p.unread) return false;
        if (kind === "dnd" && !p.dndOn) return false;
        if (kind === "customer" && !p.msgs.some((m) => m.channel === "sms" || m.channel === "call" || m.channel === "email")) return false;
        if (kind === "internal" && !p.msgs.some((m) => m.channel === "internal")) return false;
        if (kind === "sms" && !p.msgs.some((m) => m.channel === "sms")) return false;
        if (kind === "call" && !p.msgs.some((m) => m.channel === "call")) return false;
        if (kind === "email" && !p.msgs.some((m) => m.channel === "email")) return false;
        if (!q) return true;
        return [p.name, p.phone, p.last?.text, p.pipe.label, p.status].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        if (Boolean(a.unread) !== Boolean(b.unread)) return a.unread ? -1 : 1;
        return Number(Boolean(b.last)) - Number(Boolean(a.last));
      });
  }, [people, messages, followers, me, who, kind, query, appointments, leads]);

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
        <aside className={cn("flex w-full shrink-0 flex-col border-r border-line bg-card md:w-96", mobileThread && "max-md:hidden")}>
          <div className="border-b border-line px-3 py-2">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or number"
                className="h-10 w-full rounded-md border border-line bg-page pr-3 pl-9 text-sm outline-none"
              />
            </label>
            <div className="mt-2 flex items-center gap-0.5 overflow-x-auto">
              {WHO.map((f) => (
                <IconChip key={f.id} label={f.label} icon={f.icon} on={who === f.id} onClick={() => setWho(f.id)} filled={f.id === "starred" && who === "starred"} />
              ))}
              <span className="mx-1 h-5 w-px shrink-0 bg-line" />
              {KIND.map((f) => (
                <IconChip key={f.id} label={f.label} icon={f.icon} on={kind === f.id} onClick={() => setKind(f.id)} />
              ))}
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
                          <span className={cn("block truncate text-sm", t.unread ? "font-bold" : "font-semibold")}>{t.name}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1">
                            {t.status ? (
                              <span className={cn("h-5 rounded px-1.5 text-[10px] font-bold tracking-wide uppercase leading-5", stageWash(t.tone))}>
                                {t.status}
                              </span>
                            ) : null}
                            <span className="h-5 rounded bg-page px-1.5 text-[10px] font-bold tracking-wide text-muted uppercase leading-5">
                              {t.pipe.label}
                            </span>
                            {t.dndOn ? <BellOff className="size-3 text-alert" /> : null}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] text-faint">{t.last?.at ?? ""}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
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
              <header className="flex min-h-14 flex-wrap items-center gap-2 border-b border-line px-3 py-2">
                <button type="button" className="h-10 text-sm font-semibold text-navy md:hidden" onClick={() => setMobileThread(false)}>
                  Inbox
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-bold">{active.name}</h2>
                    {active.status ? (
                      <span className={cn("h-7 rounded-md px-2 text-[11px] font-bold tracking-wide uppercase leading-7", stageWash(active.tone))}>
                        {active.status}
                      </span>
                    ) : null}
                    <span className="h-7 rounded-md bg-page px-2 text-[11px] font-bold tracking-wide text-muted uppercase leading-7">
                      {active.pipe.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted">
                    {active.phone}
                    {active.city ? ` · ${active.city}` : ""}
                    {active.appt ? ` · Sep ${active.appt.day} ${active.appt.time}` : ""}
                  </p>
                </div>
                {lead ? <DndPick lead={lead} compact /> : null}
                <button type="button" aria-label={starred ? "Unstar" : "Star"} className="grid size-9 place-items-center rounded-md border border-line" onClick={() => toggleStar(active.id)}>
                  <Star className={cn("size-4", starred && "fill-navy text-navy")} />
                </button>
                <button type="button" aria-label="Book" className="grid size-9 place-items-center rounded-md border border-line" onClick={() => setLane("book")}>
                  <Calendar className="size-4" />
                </button>
                {active.phone ? (
                  <button type="button" aria-label="Call" className="grid size-9 place-items-center rounded-md border border-line" onClick={() => setCallOpen(true)}>
                    <Phone className="size-4" />
                  </button>
                ) : null}
                <a href={active.pipe.href} aria-label="Open file" className="grid size-9 place-items-center rounded-md border border-line text-navy">
                  <SquareArrowOutUpRight className="size-4" />
                </a>
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
                    <BookWidget leadId={personId} defaultCloser={active.closer} open />
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

function IconChip({
  label,
  icon: Icon,
  on,
  onClick,
  filled,
}: {
  label: string;
  icon: typeof Star;
  on: boolean;
  onClick: () => void;
  filled?: boolean;
}) {
  return (
    <Tip label={label} on side="bottom">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={cn("grid size-8 shrink-0 place-items-center rounded-md", on ? "bg-navy text-card" : "text-muted hover:bg-page")}
      >
        <Icon className={cn("size-3.5", filled && "fill-current")} />
      </button>
    </Tip>
  );
}

function LaneHead({ lane, onLane }: { lane: Lane; onLane: (v: Lane) => void }) {
  const { barRef, measureRef, iconsOnly } = useFit();
  return (
    <div className="relative border-b border-line">
      <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1 px-2 py-2 whitespace-nowrap" aria-hidden>
        {LANES.map((l) => {
          const Icon = l.icon;
          return (
            <span key={l.id} className="flex h-10 items-center gap-1.5 px-3 text-xs font-semibold">
              <Icon className="size-4" />
              {l.label}
            </span>
          );
        })}
      </div>
      <div ref={barRef} className="flex gap-1 overflow-x-auto px-2 py-2">
        {LANES.map((l) => {
          const Icon = l.icon;
          const btn = (
            <button
              key={l.id}
              type="button"
              aria-label={l.label}
              onClick={() => onLane(l.id)}
              className={cn(
                "flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold",
                lane === l.id ? "bg-navy text-card" : "text-muted hover:text-ink",
                iconsOnly && "w-10 px-0",
              )}
            >
              <Icon className="size-4" />
              {iconsOnly ? <span className="sr-only">{l.label}</span> : l.label}
            </button>
          );
          return iconsOnly ? (
            <Tip key={l.id} label={l.label} on side="bottom">
              {btn}
            </Tip>
          ) : (
            btn
          );
        })}
      </div>
    </div>
  );
}
