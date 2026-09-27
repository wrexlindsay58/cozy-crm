import { useConversations3 } from "./useConversations3";
import { VConversations01 } from "./VConversations01";
import { VConversations02 } from "./VConversations02";
import { VConversations03 } from "./VConversations03";
import { VConversations04 } from "./VConversations04";
import { cn } from "@/lib/cn";

export function VConversationsRoot({ bag }: { bag: ReturnType<typeof useConversations3> }) {
  const { active, mobileThread } = bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <VConversations01 bag={bag} /><div className="flex min-h-0 min-w-0 flex-1">
        <VConversations02 bag={bag} /><section className={cn("flex min-w-0 flex-1 flex-col bg-card", !mobileThread && "max-md:hidden")}>
          {active ? (
<>
              <VConversations03 bag={bag} /><VConversations04 bag={bag} /></>
) : (
(
            <div className="grid flex-1 place-items-center text-sm text-muted">Pick a contact.</div>
          )
)}
        </section>
      </div>
    </div>
  );
}
