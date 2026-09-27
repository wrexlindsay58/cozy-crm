import { useState } from "react";
import { addHistory, dndOn, useOps } from "@/features/ops/store";
import { sendMessage, useThread } from "@/features/thread/store";
import { accounts, type DndChannel } from "@/lib/crm-data";
import { useFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { CommentBox } from "../../comment-box";
import { Initial } from "../../who-mark";
import type { FileKind, ThreadMessage } from "@/lib/file-data";
import { ThreadPaneView2 } from "../part-06";

export function ThreadPane({
  personId,
  mode,
  onCall,
  dnd,
  actionId,
  actionKind,
  actionTitle,
  actionIds,
  scope = "house",
  onScope,
}: {
  personId: string;
  mode: "customer" | "internal" | "notes";
  onCall?: () => void;
  dnd?: DndChannel[];
  actionId?: string;
  actionKind?: "ticket" | "task" | "request";
  actionTitle?: string;
  actionIds?: string[];
  scope?: "action" | "house";
  onScope?: (next: "action" | "house") => void;
}) {
  const { draft, stamp, nest, channel, blockEmail, subject, replyRoot, files, setSubject, setReplyRoot, blockText, setDraft, setFiles, rows, houseRows, contact, setChannel, from, numbers, emails, blockCall } = useThreadPane(personId, mode, onCall, dnd, actionId, actionKind, actionTitle, actionIds, scope, onScope);


  function send() {
    if (mode === "notes") {
      sendMessage(personId, draft, "note", stamp);
      addHistory(personId, "Wrex Lindsay", "Note added.");
    } else if (mode === "internal") {
      sendMessage(personId, draft, "internal", { ...stamp, nest });
    } else if (channel === "email") {
      if (blockEmail) return;
      sendMessage(personId, draft, "email", {
        subject,
        replyTo: replyRoot?.id,
        files: files.length ? files : undefined,
        ...stamp,
      });
      addHistory(personId, "Wrex Lindsay", `Email sent${subject.trim() ? `. ${subject.trim()}` : "."}`);
      setSubject("");
      setReplyRoot(null);
    } else {
      if (blockText) return;
      sendMessage(personId, draft, "sms", { files: files.length ? files : undefined, ...stamp });
      addHistory(personId, "Wrex Lindsay", "Text sent.");
    }
    setDraft("");
    setFiles([]);
  }

  const word = actionKind ?? "ticket";
  const emptyCopy =
    scope === "action"
      ? `Nothing on this ${word} yet.`
      : mode === "internal"
        ? "None yet."
        : mode === "notes"
          ? "None yet."
          : "Nothing on this thread yet.";
  const placeholder =
    mode === "internal"
      ? "Message the shop"
      : mode === "notes"
        ? "Note"
        : channel === "email"
          ? blockEmail
            ? "DND on email"
            : "Write the email"
          : blockText
            ? "DND on texts"
            : "Send a text";
  const sendLabel = mode === "notes" ? "Add" : "Send";
  const blocked = mode === "customer" && ((channel === "sms" && blockText) || (channel === "email" && blockEmail));
  const showScope = Boolean(actionId && onScope && (mode === "customer" || mode === "internal"));

  return (
    <ThreadPaneView2 bag={{ showScope, onScope, scope, mode, word, rows, houseRows, personId, emptyCopy, contact, setChannel, setReplyRoot, setSubject, send, channel, from, numbers, emails, onCall, blockCall, replyRoot, subject, blockEmail, placeholder, draft, setDraft, blocked, files, setFiles, sendLabel }} />
  );
}

function useThreadPane(personId: any, mode: any, onCall: any, dnd: any, actionId: any, actionKind: any, actionTitle: any, actionIds: any, scope: any, onScope: any) {
  const { leads } = useOps();
  const contact =
    leads.find((l) => l.id === personId)?.name ??
    accounts.find((a) => a.id === personId)?.name ??
    "Customer";
  const ids = scope === "action" && actionIds?.length ? actionIds : undefined;
  const rows = useThread(personId, mode, ids);
  const houseRows = useThread(personId, mode);
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [replyRoot, setReplyRoot] = useState<ThreadMessage | null>(null);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [files, setFiles] = useState<{ name: string; kind: FileKind; src?: string }[]>([]);
  const from = useFrom();
  const { numbers, emails } = useMoneySettings();
  const blockText = dndOn({ dnd }, "text");
  const blockEmail = dndOn({ dnd }, "email");
  const blockCall = dndOn({ dnd }, "call");
  const stamp = scope === "action" && actionId ? { actionId, actionKind } : undefined;
  const nest =
    stamp && mode === "internal"
      ? { kind: actionKind ?? "ticket", id: actionId!, title: actionTitle || actionId! }
      : undefined;
  return { draft, stamp, nest, channel, blockEmail, subject, replyRoot, files, setSubject, setReplyRoot, blockText, setDraft, setFiles, rows, houseRows, contact, setChannel, from, numbers, emails, blockCall };
}

export type Stitched =
  | { kind: "call"; msg: ThreadMessage }
  | { kind: "sms"; msg: ThreadMessage }
  | { kind: "mail"; thread: ThreadMessage[] };

export function NoteCard({ msg }: { msg: ThreadMessage }) {
  const name = msg.by || "Cozy";
  return (
    <article className="rounded-md border border-line bg-card px-3 py-3">
      <div className="flex items-start gap-2">
        <Initial name={name} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted">
            {name} · note · {msg.at}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{msg.text}</p>
        </div>
      </div>
      <CommentBox personId={msg.personId} nest={{ kind: "note", id: msg.id, title: msg.text.slice(0, 48) }} />
    </article>
  );
}
