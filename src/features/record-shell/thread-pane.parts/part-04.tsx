import { Braces, DollarSign, FileText, Link, Paperclip, Plus, Send, Smile } from "lucide-react";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { ThreadPaneView3 } from "./part-02";
import { ComposeExtras } from "./part-03";
import { ComposeExtrasView } from "./part-05";

export function ThreadPaneView(props: { bag: { send: any; mode: any; channel: any; setChannel: any; from: any; numbers: any; emails: any; onCall: any; blockCall: any; replyRoot: any; setReplyRoot: any; setSubject: any; subject: any; blockEmail: any; personId: any; placeholder: any; draft: any; setDraft: any; blocked: any; files: any; setFiles: any; sendLabel: any } }) {
  const { send, mode, channel, setChannel, from, numbers, emails, onCall, blockCall, replyRoot, setReplyRoot, setSubject, subject, blockEmail, personId, placeholder, draft, setDraft, blocked, files, setFiles, sendLabel } = props.bag;
  return (
    <form
        className="border-t border-line p-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        {mode === "customer" ? (
          <ThreadPaneView3 bag={{ channel, setChannel, from, numbers, emails, onCall, blockCall }} />
        ) : null}
        {mode === "customer" && channel === "email" ? (
          <>
            {replyRoot ? (
              <p className="mb-2 flex items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-[12px]">
                <span className="min-w-0 truncate">Reply · {(replyRoot.subject ?? "Email").replace(/^Re:\s*/i, "")}</span>
                <button
                  type="button"
                  className="shrink-0 font-semibold text-navy"
                  onClick={() => {
                    setReplyRoot(null);
                    setSubject("");
                  }}
                >
                  Cancel
                </button>
              </p>
            ) : null}
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              disabled={blockEmail}
              className="mb-2 h-11 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy disabled:opacity-50"
            />
          </>
        ) : null}
        <label className="sr-only" htmlFor={`composer-${personId}-${mode}`}>
          {placeholder}
        </label>
        <div className="flex items-center gap-1">
          <div className="composer flex h-11 min-w-0 flex-1 items-center rounded-md border border-line bg-card focus-within:border-navy">
            <input
              id={`composer-${personId}-${mode}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={blocked}
              className="composer h-11 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none disabled:opacity-50"
            />
            {mode === "customer" ? (
              <ComposeExtras
                channel={channel}
                files={files}
                onFiles={setFiles}
                onTemplate={(body, sub) => {
                  setDraft(body);
                  if (sub) setSubject(sub);
                }}
                onInsert={(bit) => setDraft((d: any) => (d ? `${d}${d.endsWith(" ") ? "" : " "}${bit}` : bit))}
              />
            ) : null}
          </div>
          <button type="submit" aria-label={sendLabel} className="composer grid h-11 w-11 shrink-0 place-items-center rounded-md bg-navy text-card lg:inline-flex lg:w-auto lg:gap-1.5 lg:px-3 lg:text-sm lg:font-semibold">
            <Send className="size-4" />
            <span className="composer-label">{sendLabel}</span>
          </button>
        </div>
      </form>
  );
}

export function ComposeExtrasView2(props: { bag: { fileRef: any; addFile: any; open: any; btnRef: any; toggle: any; files: any; box: any; pane: any; close: any; setPane: any; canned: any; onTemplate: any; onInsert: any } }) {
  const { fileRef, addFile, open, btnRef, toggle, files, box, pane, close, setPane, canned, onTemplate, onInsert } = props.bag;
  return (
    <div className="relative flex h-full w-10 shrink-0 items-center justify-center self-stretch border-l border-line">
      <input ref={fileRef} type="file" className="sr-only" accept="image/*,video/*,.pdf,.doc,.docx" onChange={(e) => addFile(e.target.files?.[0])} />
      <Tip label="Insert" on={!open} side="top">
        <button
          ref={btnRef}
          type="button"
          aria-label="Insert"
          aria-expanded={open}
          onClick={toggle}
          className="grid size-8 place-items-center text-navy"
        >
          <Plus className="size-4" />
          {files.length ? (
            <span className="absolute top-1 right-1 grid size-3.5 place-items-center rounded-full bg-navy text-[8px] font-bold text-card">{files.length}</span>
          ) : null}
        </button>
      </Tip>
      {open && box ? (
        <Float key={pane} anchor={box} prefer="top" onClose={close}>
              {pane === "icons" ? (
                <div className="flex items-center gap-2 p-1.5">
                  {(
                    [
                      { id: "attach", label: files.length ? files.map((f: any) => f.name).join(", ") : "Attach", icon: Paperclip, run: () => fileRef.current?.click() },
                      { id: "templates", label: "Templates", icon: FileText, run: () => setPane("templates") },
                      { id: "links", label: "Trigger links", icon: Link, run: () => setPane("links") },
                      { id: "values", label: "Custom values", icon: Braces, run: () => setPane("values") },
                      { id: "pay", label: "Request payment", icon: DollarSign, run: () => setPane("pay") },
                      { id: "emoji", label: "Emojis", icon: Smile, run: () => setPane("emoji") },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <Tip key={item.id} label={item.label} on side="top">
                        <button type="button" aria-label={item.label} onClick={item.run} className="grid size-11 place-items-center rounded-md text-navy hover:bg-page">
                          <Icon className="size-4" />
                        </button>
                      </Tip>
                    );
                  })}
                </div>
              ) : (
                <ComposeExtrasView bag={{ setPane, pane, canned, onTemplate, close, onInsert }} />
              )}
        </Float>
      ) : null}
    </div>
  );
}
