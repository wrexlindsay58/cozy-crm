import { useConversations1 } from "./useConversations1";
import { useConversations2 } from "./useConversations2";
import { useConversations3 } from "./useConversations3";
import { VConversationsRoot } from "./VConversationsRoot";

export function Conversations() {
  const bag0 = useConversations1();
  const bag1 = useConversations2(bag0);
  const bag2 = useConversations3(bag1);
  const bag = bag2;
  return <VConversationsRoot bag={bag} />;
}

export type ConversationsBag = Parameters<typeof VConversationsRoot>[0]["bag"];

export * from "./bits-01";
export * from "./bits-02";
export * from "./bits-03";
export * from "./bits-04";
export * from "./bits-05";
export * from "./bits-06";
export * from "./useConversations1";
export * from "./useConversations2";
export * from "./useConversations3";
export * from "./VConversations01";
export * from "./VConversations02";
export * from "./VConversations03";
export * from "./VConversations04";
export * from "./VConversationsRoot";
