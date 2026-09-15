import { useMemo, useRef, useState } from "react";
import { Mail, MessageSquare, Phone, Search, Send, X } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  byId,
  conversations as seed,
  leads,
  money,
  opportunities,
  type Channel,
  type ChatMsg,
} from "@/lib/crm-data";
import { Btn, PageTitle, StatusBar } from "@/components/ui-bits";

const FILTERS: { id: "all" | "unread" | "sms" | "call" | "email"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "sms", label: "SMS" },
  { id: "call", label: "Calls" },
  { id: "email", label: "Email" },
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

function ChannelIcon({ channel }: { channel: Channel }) {
  if (channel === "call") return <Phone className="size-3.5" />;
  if (channel === "email") return <Mail className="size-3.5" />;
  if (channel === "note") return null;
  return <MessageSquare className="size-3.5" />;
}

export function Conversations() {
  const [threads, setThreads] = useState(() =>
    seed.map((t, i) => (i === 0 ? { ...t, unread: 0 } : t)),
  );
  const [activeId, setActiveId] = useState(seed[0]?.id ?? "");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"sms" | "email">("sms");
  const [mobileThread, setMobileThread] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads.filter((t) => {
      const lead = byId(leads, t.leadId);
      if (filter === "unread" && t.unread === 0) return false;
      if (filter !== "all" && filter !== "unread" && t.channel !== filter) return false;
      if (!q) return true;
      return [lead?.name, lead?.phone, t.messages.at(-1)?.text, t.assigned].join(" ").toLowerCase().includes(q);
    });
  }, [threads, filter, query]);

  const active = threads.find((t) => t.id === activeId) ?? list[0];
  const lead = active ? byId(leads, active.leadId) : undefined;
  const opp = active ? opportunities.find((o) => o.leadId === active.leadId) : undefined;

  function openThread(id: string) {
    setActiveId(id);
    setMobileThread(true);
    setFileOpen(false);
    setThreads((rows) => rows.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  }

  function push(channel: Channel, text: string) {
    if (!text || !active) return;
    const msg: ChatMsg = {
      id: `n-${Date.now()}`,
      at: "Now",
      dir: "out",
      channel,
      text,
      who: "Wrex Lindsay",
    };
    setThreads((rows) =>
      rows.map((t) =>
        t.id === active.id
          ? { ...t, lastAt: "Now", channel: channel === "note" ? t.channel : channel, messages: [...t.messages, msg] }
          : t,
      ),
    );
    setDraft("");
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ block: "end" }));
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
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
                className="h-10 w-full rounded-md border border-line bg-page pr-3 pl-9 text-[13px] outline-none"
              />
            </label>
            <div className="mt-3 flex gap-1 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "h-8 shrink-0 rounded-sm px-3 text-[13px] font-semibold",
                    filter === f.id ? "bg-navy text-card" : "bg-page text-muted hover:text-ink",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-auto">
            {list.map((t) => {
              const person = byId(leads, t.leadId);
              const last = t.messages.at(-1);
              const on = t.id === active?.id;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openThread(t.id)}
                    className={cn(
                      "flex w-full items-start gap-3 border-b border-line px-3 py-3 text-left",
                      on ? "border-l-4 border-l-navy bg-page" : "border-l-4 border-l-transparent hover:bg-page/70",
                    )}
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-navy text-[11px] font-bold text-card">
                      {initials(person?.name ?? "?")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">{person?.name}</span>
                        <span className="text-[11px] text-faint">{t.lastAt}</span>
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                        <ChannelIcon channel={last?.channel ?? t.channel} />
                        <span className="truncate">{last?.channel === "note" ? `Note: ${last.text}` : last?.text}</span>
                      </span>
                    </span>
                    {t.unread > 0 ? <i className="mt-2 size-2 shrink-0 rounded-sm bg-navy" aria-label="Unread" /> : null}
                  </button>
                </li>
              );
            })}
            {list.length === 0 ? <li className="px-4 py-8 text-[13px] text-muted">No threads.</li> : null}
          </ul>
        </aside>

        <section className={cn("flex min-w-0 flex-1 flex-col bg-page", !mobileThread && "max-md:hidden")}>
          {active && lead ? (
            <>
              <header className="flex min-h-14 flex-wrap items-center gap-2 border-b border-line bg-card px-4 py-2">
                <button type="button" className="h-10 text-[13px] font-semibold text-navy md:hidden" onClick={() => setMobileThread(false)}>
                  Inbox
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-bold">{lead.name}</h2>
                  <p className="text-[11px] text-muted">
                    {lead.phone} · {lead.city}
                  </p>
                </div>
                <a href={`tel:${lead.phone}`} className="grid size-10 place-items-center rounded-md bg-page" aria-label="Call">
                  <Phone className="size-4" />
                </a>
                <button
                  type="button"
                  className="grid h-10 px-3 text-[13px] font-semibold"
                  onClick={() => setFileOpen(true)}
                >
                  File
                </button>
              </header>

              <div className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-4">
                {active.messages.map((m) =>
                  m.channel === "note" ? (
                    <div key={m.id} className="rounded-sm border-l-4 border-l-navy bg-info-bg px-3 py-2 text-[13px]">
                      <p className="text-[11px] font-semibold text-muted">
                        Note · {m.who} · {m.at}
                      </p>
                      <p className="mt-1">{m.text}</p>
                    </div>
                  ) : (
                    <div key={m.id} className={cn("flex", m.dir === "out" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[min(100%,36rem)] rounded-sm px-3 py-2 text-[13px] leading-relaxed",
                          m.dir === "out" ? "bg-navy text-card" : "bg-card text-ink shadow-card",
                        )}
                      >
                        <p className={cn("text-[11px] font-semibold", m.dir === "out" ? "text-navy-fg" : "text-muted")}>
                          {m.who} · {m.at} · {m.channel}
                        </p>
                        <p className="mt-1">{m.text}</p>
                      </div>
                    </div>
                  ),
                )}
                <div ref={endRef} />
              </div>

              <form
                className="border-t border-line bg-card p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  push(mode, draft.trim());
                }}
              >
                <div className="mb-2 flex items-center gap-1">
                  {(["sms", "email"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setMode(ch)}
                      className={cn(
                        "h-8 rounded-sm px-3 text-[11px] font-bold uppercase tracking-wide",
                        mode === ch ? "bg-navy text-card" : "text-muted hover:text-ink",
                      )}
                    >
                      {ch}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => push("note", draft.trim())}
                    className="ml-auto h-8 rounded-sm px-3 text-[11px] font-bold uppercase tracking-wide text-muted hover:text-ink"
                  >
                    Note
                  </button>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        push(mode, draft.trim());
                      }
                    }}
                    rows={2}
                    placeholder={mode === "sms" ? "Text" : "Email"}
                    className="min-h-12 flex-1 resize-none rounded-md border border-line bg-page px-3 py-2 text-[13px] outline-none"
                  />
                  <button type="submit" className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-navy text-card" aria-label="Send">
                    <Send className="size-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-[13px] text-muted">Pick a thread.</div>
          )}
        </section>
      </div>

      {fileOpen && lead ? (
        <>
          <button type="button" className="absolute inset-0 z-20 bg-ink/40" aria-label="Close file" onClick={() => setFileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 z-30 flex w-80 max-w-full flex-col overflow-auto border-l border-line bg-card">
            <div className="flex min-h-14 items-center justify-between border-b border-line px-4">
              <h3 className="text-[16px] font-bold">{lead.name}</h3>
              <button type="button" className="grid size-10 place-items-center" aria-label="Close" onClick={() => setFileOpen(false)}>
                <X className="size-4" />
              </button>
            </div>
            <div className="px-4 py-3">
              <StatusBar label={lead.status} tone={lead.tone} />
            </div>
            <dl className="space-y-3 px-4 text-[13px]">
              <Field k="Phone" v={lead.phone} />
              <Field k="Email" v={lead.email} />
              <Field k="Address" v={`${lead.address}, ${lead.city}`} />
              <Field k="Source" v={lead.source} />
              <Field k="Setter" v={lead.setter} />
              <Field k="Closer" v={lead.closer} />
              <Field k="Product" v={lead.product} />
              <Field k="Est." v={money(lead.value)} />
              <Field k="Next" v={lead.next} />
            </dl>
            {opp ? (
              <div className="mx-4 mt-4 rounded-sm bg-page p-3 text-[13px]">
                <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Opportunity</p>
                <p className="font-semibold">{opp.stage}</p>
                <p className="tabular-nums text-muted">{money(opp.amount)}</p>
              </div>
            ) : null}
            <p className="px-4 py-4 text-[13px] text-muted">{lead.notes}</p>
            <div className="mt-auto p-4">
              <Btn href={`/leads/${lead.id}`}>Open lead</Btn>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
