import { useMemo, useState } from "react";
import { Clock, Mail, MessageSquare, Phone, Search, StickyNote, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { accounts, byId } from "@/lib/crm-data";
import { SHOP_ACTOR } from "@/lib/chrome";
import { pipelineOf } from "@/lib/pipeline-of";
import { ClickToCall } from "@/features/lead/click-to-call";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { useAssessments } from "@/features/assessment/store";
import { useMessages } from "@/features/thread/store";
import { HistoryList } from "@/features/record-shell/side-rails";
import { ThreadPane } from "@/features/record-shell/thread-pane";
import { Tip } from "@/components/tip";
import { useFit } from "@/components/use-fit";
import { PageTitle } from "@/components/ui-bits";

const WHO = [
  { id: "all", label: "All" },
  { id: "mine", label: "Mine" },
  { id: "following", label: "Following" },
] as const;

const KIND = [
  { id: "all", label: "All talk" },
  { id: "unread", label: "Unread" },
  { id: "customer", label: "Customer" },
  { id: "internal", label: "Internal" },
  { id: "sms", label: "SMS" },
  { id: "call", label: "Calls" },
  { id: "email", label: "Email" },
] as const;

const LANES = [
  { id: "customer", label: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", icon: Users },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "history", label: "History", icon: Clock },
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

export function Conversations() {
  const messages = useMessages();
  const { leads, followers, history } = useOps();
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
        const msgs = messages.filter(
          (m) => m.personId === p.id || m.personId === p.leadId || (acc && m.personId === acc.id),
        );
        const last = msgs.at(-1);
        const follow = followers[p.id] ?? followers[p.leadId ?? ""] ?? [];
        const assigned = p.closer === me || p.setter === me;
        const following = follow.some((f) => f.name === me);
        const unread = last?.from === "customer";
        const pipe = pipelineOf(p.leadId ?? p.id, p.name);
        return { ...p, msgs, last, follow, assigned, following, unread, pipe };
      })
      .filter((p) => {
        if (who === "mine" && !p.assigned) return false;
        if (who === "following" && !p.following) return false;
        if (kind === "unread" && !p.unread) return false;
        if (kind === "customer" && !p.msgs.some((m) => m.channel === "sms" || m.channel === "call" || m.channel === "email")) return false;
        if (kind === "internal" && !p.msgs.some((m) => m.channel === "internal")) return false;
        if (kind === "sms" && !p.msgs.some((m) => m.channel === "sms")) return false;
        if (kind === "call" && !p.msgs.some((m) => m.channel === "call")) return false;
        if (kind === "email" && !p.msgs.some((m) => m.channel === "email")) return false;
        if (!q) return true;
        return [p.name, p.phone, p.last?.text, p.pipe.label].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => Number(Boolean(b.last)) - Number(Boolean(a.last)));
  }, [people, messages, followers, me, who, kind, query]);

  const active = rows.find((r) => r.id === activeId) ?? rows[0];
  const lead = active ? byId(leads, active.leadId ?? active.id) : undefined;
  const personId = active?.leadId ?? active?.id ?? "";
  const acc = active ? accounts.find((a) => a.name === active.name) : undefined;
  const onAcc = acc ? messages.filter((m) => m.personId === acc.id).length : 0;
  const onLead = messages.filter((m) => m.personId === personId).length;
  const threadId = onAcc > onLead && acc ? acc.id : personId;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <header className="shrink-0 border-b border-line bg-card px-4">
        <PageTitle title="Inbox" flush />
      </header>

      <div className="flex min-h-0 min-w-0 flex-1">
        <aside className={cn("flex w-full shrink-0 flex-col border-r border-line bg-card md:w-80", mobileThread && "max-md:hidden")}>
          <div className="border-b border-line px-3 py-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name or number"
                className="h-10 w-full rounded-md border border-line bg-page pr-3 pl-9 text-sm outline-none"
              />
            </label>
            <ChipRow
              items={WHO}
              value={who}
              onChange={setWho}
            />
            <ChipRow
              items={KIND}
              value={kind}
              onChange={setKind}
            />
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {rows.map((t) => {
              const on = t.id === active?.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(t.id);
                      setMobileThread(true);
                      setCallOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-line px-3 py-3 text-left",
                      on ? "border-l-4 border-l-navy bg-page" : "border-l-4 border-l-transparent hover:bg-page/70",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-md bg-navy text-[11px] font-bold text-card">
                      {initials(t.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{t.name}</span>
                        <span className="text-[11px] text-faint">{t.last?.at ?? ""}</span>
                      </span>
                      <span className="mt-0.5 text-[11px] font-bold tracking-wide text-muted uppercase">{t.pipe.label}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                        {t.last?.channel === "call" ? <Phone className="size-3.5" /> : t.last?.channel === "email" ? <Mail className="size-3.5" /> : t.last?.channel === "internal" ? <Users className="size-3.5" /> : <MessageSquare className="size-3.5" />}
                        <span className="truncate">{t.last?.text ?? "No talk yet"}</span>
                      </span>
                    </span>
                    {t.unread ? <i className="mt-2 size-2 shrink-0 rounded-sm bg-navy" aria-label="Unread" /> : null}
                  </button>
                </li>
              );
            })}
            {rows.length === 0 ? <li className="px-4 py-8 text-sm text-muted">No contacts.</li> : null}
          </ul>
        </aside>

        <section className={cn("flex min-w-0 flex-1 flex-col bg-card", !mobileThread && "max-md:hidden")}>
          {active ? (
            <>
              <header className="flex min-h-14 flex-wrap items-center gap-2 border-b border-line px-4 py-2">
                <button type="button" className="h-10 text-sm font-semibold text-navy md:hidden" onClick={() => setMobileThread(false)}>
                  Inbox
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-bold">{active.name}</h2>
                  <p className="text-[11px] text-muted">
                    {active.phone}
                    {active.city ? ` · ${active.city}` : ""}
                  </p>
                </div>
                <a href={active.pipe.href} className="h-7 rounded-md bg-info-bg px-2 text-[11px] font-bold tracking-wide text-navy uppercase leading-7">
                  {active.pipe.label}
                </a>
                {active.phone ? (
                  <button
                    type="button"
                    aria-label="Call"
                    className="grid size-11 place-items-center rounded-md border border-line"
                    onClick={() => setCallOpen(true)}
                  >
                    <Phone className="size-4" />
                  </button>
                ) : null}
              </header>
              <LaneHead lane={lane} onLane={setLane} />
              <div className="min-h-0 flex-1 overflow-hidden">
                {callOpen && active.phone ? (
                  <div className="p-2">
                    <ClickToCall personId={threadId} phone={active.phone} name={active.name} open={callOpen} onClose={() => setCallOpen(false)} />
                  </div>
                ) : null}
                {lane === "history" ? (
                  <div className="h-full overflow-auto p-3">
                    <HistoryList history={history?.[threadId] ?? history?.[personId] ?? []} flush />
                  </div>
                ) : (
                  <ThreadPane personId={threadId} mode={lane} onCall={() => setCallOpen(true)} dnd={lead?.dnd} />
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

function ChipRow<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {items.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "h-8 shrink-0 rounded-md px-2.5 text-[12px] font-semibold",
            value === f.id ? "bg-navy text-card" : "bg-page text-muted hover:text-ink",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
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
      <div ref={barRef} className="flex gap-1 px-2 py-2">
        {LANES.map((l) => {
          const Icon = l.icon;
          const on = lane === l.id;
          const btn = (
            <button
              key={l.id}
              type="button"
              aria-label={l.label}
              onClick={() => onLane(l.id)}
              className={cn(
                "flex h-10 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold",
                on ? "bg-navy text-card" : "text-muted hover:text-ink",
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
