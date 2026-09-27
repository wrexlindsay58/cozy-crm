import { useConversations3 } from "./useConversations3";
import { PageTitle } from "@/components/ui-bits";

export function VConversations01({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  return (
    <>
<header className="shrink-0 border-b border-line bg-card px-4">
        <PageTitle title="Inbox" flush />
      </header>
    </>
  );
}
