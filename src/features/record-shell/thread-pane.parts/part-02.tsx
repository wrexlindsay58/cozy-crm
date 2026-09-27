import { setCallFrom, setEmailFrom, setSmsFrom } from "@/features/from/store";
import { TalkLine } from "../talk-line";
import { cn } from "@/lib/cn";
import { Initial, whoName } from "../who-mark";
import type { ThreadMessage, ThreadNest } from "@/lib/file-data";
import type { Stitched } from "./part-01";
import { FromSplit } from "./part-03";

export function stitch(rows: ThreadMessage[]): Stitched[] {
  const mail = rows.filter((m) => m.channel === "email");
  const byId = new Map(mail.map((m) => [m.id, m]));
  function rootOf(m: ThreadMessage) {
    let cur = m;
    const seen = new Set<string>();
    while (cur.replyTo && byId.has(cur.replyTo) && !seen.has(cur.id)) {
      seen.add(cur.id);
      const next = byId.get(cur.replyTo);
      if (!next) break;
      cur = next;
    }
    return cur.id;
  }
  const groups = new Map<string, ThreadMessage[]>();
  for (const m of mail) {
    const id = rootOf(m);
    const list = groups.get(id) ?? [];
    list.push(m);
    groups.set(id, list);
  }
  const last = new Map<string, string>();
  for (const [id, list] of groups) last.set(id, list[list.length - 1]?.id ?? id);
  const out: Stitched[] = [];
  for (const m of rows) {
    if (m.channel === "email") {
      const id = rootOf(m);
      if (m.id !== last.get(id)) continue;
      const thread = groups.get(id);
      if (thread) out.push({ kind: "mail", thread });
      continue;
    }
    if (m.channel === "call") out.push({ kind: "call", msg: m });
    else out.push({ kind: "sms", msg: m });
  }
  return out;
}

export function Bubble({ msg, contact }: { msg: ThreadMessage; contact: string }) {
  const name = whoName(msg, contact);
  const mine = msg.from === "shop";
  return (
    <div className={cn("flex max-w-[92%] items-end gap-2", mine && "ml-auto flex-row-reverse")}>
      <Initial name={name} />
      <div className="min-w-0">
        <p className={cn("text-[10px] font-semibold text-muted", mine && "text-right")}>
          {name} · {msg.channel} · {msg.at}
        </p>
        <p className={cn("mt-0.5 rounded-md px-2.5 py-2 text-sm", mine ? "bg-navy text-card" : "bg-page text-ink")}>{msg.text}</p>
        {msg.files?.length ? (
          <p className={cn("mt-1 text-[11px] text-muted", mine && "text-right")}>{msg.files.map((f) => f.name).join(" · ")}</p>
        ) : null}
      </div>
    </div>
  );
}

export function groupInternal(rows: ThreadMessage[]) {
  const blocks: { nest?: ThreadNest; items: ThreadMessage[] }[] = [];
  for (const m of rows) {
    if (!m.nest) {
      blocks.push({ items: [m] });
      continue;
    }
    const last = blocks[blocks.length - 1];
    if (last?.nest && last.nest.kind === m.nest.kind && last.nest.id === m.nest.id) last.items.push(m);
    else blocks.push({ nest: m.nest, items: [m] });
  }
  return blocks;
}

export function NestBlock({
  nest,
  items,
  replies,
  personId,
  contact,
}: {
  nest: ThreadNest;
  items: ThreadMessage[];
  replies: ThreadMessage[];
  personId: string;
  contact: string;
}) {
  const label = nest.kind === "ticket" ? "Ticket" : nest.kind === "task" ? "Task" : nest.kind === "request" ? "Request" : nest.kind === "note" ? "Note" : "Media";
  return (
    <div className="rounded-md border border-line bg-card px-2.5 py-2">
      <p className="text-[10px] font-bold tracking-wide text-muted uppercase">
        {label} · {nest.title}
      </p>
      <div className="mt-2 space-y-3">
        {items.map((m) => (
          <TalkLine key={m.id} msg={m} personId={personId} contact={contact} nest={nest} replies={replies.filter((r) => r.replyTo === m.id)} />
        ))}
      </div>
    </div>
  );
}

export function ThreadPaneView3(props: { bag: { channel: any; setChannel: any; from: any; numbers: any; emails: any; onCall: any; blockCall: any } }) {
  const { channel, setChannel, from, numbers, emails, onCall, blockCall } = props.bag;
  return (
    <div className="mb-2 flex items-center gap-1">
            <FromSplit
              label="SMS"
              active={channel === "sms"}
              onPick={() => setChannel("sms")}
              current={from.smsFrom}
              options={numbers.map((n: any) => ({ label: `${n.office} · ${n.number}`, value: n.number }))}
              onFrom={setSmsFrom}
            />
            <FromSplit
              label="Email"
              active={channel === "email"}
              onPick={() => setChannel("email")}
              current={from.emailFrom}
              options={emails.map((n: any) => ({ label: `${n.office} · ${n.email}`, value: n.email }))}
              onFrom={setEmailFrom}
            />
            {onCall ? (
              <div className="ml-auto">
                <FromSplit
                  label=""
                  aria="Call"
                  icon
                  onPick={onCall}
                  current={from.callFrom}
                  options={numbers.map((n: any) => ({ label: `${n.office} · ${n.number}`, value: n.number }))}
                  onFrom={setCallFrom}
                  disabled={blockCall}
                />
              </div>
            ) : null}
          </div>
  );
}
