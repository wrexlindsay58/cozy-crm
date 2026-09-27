import { useTodayBoard } from "./useTodayBoard";
import { VTodayBoard01 } from "./VTodayBoard01";
import { VTodayBoard02 } from "./VTodayBoard02";
import { VTodayBoard03 } from "./VTodayBoard03";
import { VTodayBoard04 } from "./VTodayBoard04";
import { VTodayBoard05 } from "./VTodayBoard05";
import { VTodayBoard06 } from "./VTodayBoard06";
import { VTodayBoard07 } from "./VTodayBoard07";
import { VTodayBoard08 } from "./VTodayBoard08";
import { SalesDashboard } from "@/components/sales-dashboard";

export function VTodayBoardRoot({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { sales, salesSlot } = bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <VTodayBoard01 bag={bag} />{sales ? (
(
        <SalesDashboard embedded filterSlot={salesSlot} />
      )
) : (
<>
      <VTodayBoard02 bag={bag} /><div className="relative flex min-h-0 flex-1 flex-col xl:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-auto">
        <div className="space-y-3 bg-page p-3">
          <VTodayBoard03 bag={bag} /><VTodayBoard04 bag={bag} /><VTodayBoard05 bag={bag} /><VTodayBoard06 bag={bag} /><VTodayBoard07 bag={bag} /></div>
        </div>
        <VTodayBoard08 bag={bag} /></div>
      </>
)}
    </div>
  );
}
