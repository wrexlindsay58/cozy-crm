import { Cell } from "./bits-03";
import { useTodayBoard } from "./useTodayBoard";
import { money } from "@/lib/crm-data";

export function VTodayBoard03({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { t } = bag;
  return (
    <>
<section className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-line lg:grid-cols-5">
            <Cell
              label="Sold $"
              value={money(t.sold)}
              trend={t.trends.sales}
              mark={t.marks.sales}
              hint={`${t.soldN} deals`}
            />
            <Cell
              label={
                <>
                  <span className="min-[1471px]:hidden">Close %</span>
                  <span className="hidden min-[1471px]:inline">Close rate</span>
                </>
              }
              value={`${t.closeRate}%`}
              trend={t.trends.close}
              mark={t.marks.close}
              ring
              pct
              hint={`${t.soldN} of ${t.decided} decided`}
            />
            <Cell
              label="Avg ticket"
              value={money(t.ticket)}
              trend={t.trends.ticket}
              mark={t.marks.ticket}
              hint={`${t.soldN} deals`}
            />
            <Cell
              label="Jobs sold"
              value={String(t.soldN)}
              trend={t.trends.deals}
              mark={t.marks.deals}
              hint={`${t.soldN} jobs sold`}
            />
            <Cell
              label="Memberships"
              value={String(t.members)}
              trend={t.trends.members}
              meta={money(t.memberSold)}
              hint={`${t.members} sold · ${money(t.memberSold)}`}
            />
          </section>
    </>
  );
}
