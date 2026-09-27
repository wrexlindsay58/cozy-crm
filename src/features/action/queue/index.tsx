import { useActionQueue1 } from "./useActionQueue1";
import { useActionQueue2 } from "./useActionQueue2";
import { VActionQueueRoot } from "./VActionQueueRoot";

export function ActionQueue({ selectedId }: { selectedId?: string }) {
  const bag0 = useActionQueue1({ selectedId });
  const bag1 = useActionQueue2(bag0);
  const bag = bag1;
  return <VActionQueueRoot bag={bag} />;
}

export type ActionQueueBag = Parameters<typeof VActionQueueRoot>[0]["bag"];

export * from "./bits-01";
export * from "./bits-02";
export * from "./bits-03";
export * from "./bits-04";
export * from "./bits-05";
export * from "./bits-06";
export * from "./bits-07";
export * from "./bits-08";
export * from "./useActionQueue1";
export * from "./useActionQueue2";
export * from "./VActionQueue01";
export * from "./VActionQueue02";
export * from "./VActionQueue03";
export * from "./VActionQueue04";
export * from "./VActionQueueRoot";
