import { useSalesDashboard3 } from "./useSalesDashboard3";
import { VSalesDashboard01 } from "./VSalesDashboard01";
import { VSalesDashboard02 } from "./VSalesDashboard02";
import { VSalesDashboard03 } from "./VSalesDashboard03";
import { VSalesDashboard04 } from "./VSalesDashboard04";
import { VSalesDashboard05 } from "./VSalesDashboard05";
import { VSalesDashboard06 } from "./VSalesDashboard06";
import { VSalesDashboard07 } from "./VSalesDashboard07";
import { VSalesDashboard08 } from "./VSalesDashboard08";
import { VSalesDashboard09 } from "./VSalesDashboard09";

export function VSalesDashboardRoot({ bag }: { bag: ReturnType<typeof useSalesDashboard3> }) {
  const { embedded } = bag;
  return (
    <div className={embedded ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-page" : "h-full min-w-0 space-y-3 overflow-x-hidden overflow-y-auto bg-page p-3"}>
      <VSalesDashboard01 bag={bag} /><div className={embedded ? "min-h-0 flex-1 space-y-3 overflow-y-auto p-3" : "contents"}>
      <VSalesDashboard02 bag={bag} /><VSalesDashboard03 bag={bag} /><VSalesDashboard04 bag={bag} /><VSalesDashboard05 bag={bag} /><VSalesDashboard06 bag={bag} /><VSalesDashboard07 bag={bag} /><VSalesDashboard08 bag={bag} /><VSalesDashboard09 bag={bag} /></div>
    </div>
  );
}
