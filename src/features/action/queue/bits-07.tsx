import { KindFilter, SortKey, KINDS, STATUS_OPTS, SORT_OPTS } from "./bits-01";
import { MenuPick } from "./bits-08";
import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, CircleDot, Layers } from "lucide-react";

export function FilterRow({
  kind,
  status,
  sort,
  counts,
  onKind,
  onStatus,
  onSort,
}: {
  kind: KindFilter;
  status: string;
  sort: SortKey;
  counts: { all: number; ticket: number; task: number; request: number };
  onKind: (v: KindFilter) => void;
  onStatus: (v: string) => void;
  onSort: (v: SortKey) => void;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [icons, setIcons] = useState(true);
  useEffect(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;
    const fit = () => setIcons(measure.scrollWidth > bar.clientWidth + 8);
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    fit();
    return () => ro.disconnect();
  }, [kind, status, sort, counts]);
  return (
    <div className="relative min-w-0">
      <div ref={measureRef} className="pointer-events-none invisible absolute flex gap-1 whitespace-nowrap" aria-hidden>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Type {KINDS.find((k) => k.id === kind)?.label}
          <span className="inline-block w-3.5" />
        </span>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Status {STATUS_OPTS.find((s) => s.id === status)?.label}
          <span className="inline-block w-3.5" />
        </span>
        <span className="inline-flex h-11 items-center gap-1.5 px-3 text-[13px] font-semibold">
          Sort {SORT_OPTS.find((s) => s.id === sort)?.label}
          <span className="inline-block w-3.5" />
        </span>
      </div>
      <div ref={barRef} className="flex w-full min-w-0 items-center gap-1 overflow-hidden">
        <MenuPick
          label="Type"
          value={kind}
          options={KINDS.map((k) => ({ ...k, count: counts[k.id] }))}
          onChange={onKind}
          icon={Layers}
          iconsOnly={icons}
        />
        <MenuPick label="Status" value={status} options={STATUS_OPTS} onChange={onStatus} icon={CircleDot} iconsOnly={icons} />
        <MenuPick label="Sort" value={sort} options={SORT_OPTS} onChange={onSort} icon={ArrowUpDown} iconsOnly={icons} />
      </div>
    </div>
  );
}
