import type { ThreadMessage } from "@/lib/file-data";

export function EmailCard({ msg }: { msg: ThreadMessage }) {
  const out = msg.from === "shop";
  return (
    <article className="rounded-md border border-line bg-page p-3">
      <p className="text-[11px] font-semibold text-muted">
        Email · {out ? "Cozy" : "Customer"} · {msg.at}
      </p>
      {msg.subject ? <p className="mt-1 text-sm font-semibold">{msg.subject}</p> : null}
      <p className="mt-1 whitespace-pre-wrap text-sm">{msg.text}</p>
      {msg.files?.length ? (
        <p className="mt-2 text-[11px] font-semibold text-muted">{msg.files.map((f) => f.name).join(" · ")}</p>
      ) : null}
    </article>
  );
}
