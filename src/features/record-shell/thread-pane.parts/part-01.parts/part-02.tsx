import { TalkLine } from "../../talk-line";
import type { ThreadMessage } from "@/lib/file-data";

export function PlainInternal({ msg, personId, contact, replies }: { msg: ThreadMessage; personId: string; contact: string; replies: ThreadMessage[] }) {
  return (
    <div className="rounded-md border border-line p-2.5">
      <TalkLine msg={msg} personId={personId} contact={contact} replies={replies} />
    </div>
  );
}
