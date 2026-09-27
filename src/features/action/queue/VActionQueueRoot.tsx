import { useActionQueue2 } from "./useActionQueue2";
import { VActionQueue01 } from "./VActionQueue01";
import { VActionQueue02 } from "./VActionQueue02";
import { VActionQueue03 } from "./VActionQueue03";
import { VActionQueue04 } from "./VActionQueue04";
import { cn } from "@/lib/cn";

export function VActionQueueRoot({ bag }: { bag: ReturnType<typeof useActionQueue2> }) {
  const { editOpen, mobileTalk } = bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <div
        className={cn(
          "relative grid min-h-0 min-w-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)]",
          editOpen ? "md:grid-cols-[minmax(0,34%)_minmax(0,1fr)_minmax(18rem,32%)]" : "md:grid-cols-[minmax(0,50%)_minmax(0,1fr)]",
        )}
      >
        <VActionQueue01 bag={bag} /><VActionQueue02 bag={bag} /><section className={cn("flex min-h-0 min-w-0 flex-col bg-card md:col-start-2 md:row-start-2", !mobileTalk && "max-md:hidden")}>
          <VActionQueue03 bag={bag} /></section>
        <VActionQueue04 bag={bag} /></div>
    </div>
  );
}
