import { useConversations2 } from "./useConversations2";
import { isStarred, markRead } from "@/features/thread/store";

export function useConversations3(bag: ReturnType<typeof useConversations2>) {
  const { setActiveId, setMobileThread, setCallOpen, active, personId, acc, onAcc, onLead } = bag;
const threadId = onAcc > onLead && acc ? acc.id : personId;

const starred = active ? isStarred(active.id) || isStarred(personId) : false;

function openRow(id: string) {
    setActiveId(id);
    setMobileThread(true);
    setCallOpen(false);
    markRead(id);
  }
  return { ...bag, threadId, starred, openRow };
}
