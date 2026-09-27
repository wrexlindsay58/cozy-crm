import { useTodayBoard } from "./useTodayBoard";
import { money } from "@/lib/crm-data";

export function VTodayBoard02({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { setFeed, t } = bag;
  return (
    <>
<div className="flex shrink-0 items-center gap-2 border-b border-line bg-card px-4 py-2.5 max-md:px-3">
      <p className="min-w-0 flex-1 text-center text-[15px] tabular-nums max-md:text-left max-md:text-[13px] max-md:leading-5">
        <span className="font-bold">{money(t.sold)} sold</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.closeRate}% close</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.left} runs left</span>
        <span className="text-muted"> · </span>
        <span className="font-bold">{t.members} memberships · {money(t.memberSold)}</span>
        {t.behindN ? (
          <>
            <span className="text-muted"> · </span>
            <span className="font-bold text-stop">{t.behindN} installs late</span>
          </>
        ) : null}
      </p>
      <button type="button" onClick={() => setFeed(true)} className="h-9 shrink-0 rounded-md bg-navy px-3 text-[12px] font-bold text-card xl:hidden">
        Feed
      </button>
      </div>
    </>
  );
}
