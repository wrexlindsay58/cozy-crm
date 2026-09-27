import { tip } from "./bits-01";
import { Cell as RCell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";

export function popSlice(props: {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  fill?: string;
}) {
  return (
    <Sector
      cx={props.cx}
      cy={props.cy}
      innerRadius={Math.max((props.innerRadius ?? 0) - 1, 0)}
      outerRadius={(props.outerRadius ?? 0) + 7}
      startAngle={props.startAngle}
      endAngle={props.endAngle}
      fill={props.fill}
      stroke="var(--color-card)"
      strokeWidth={1.5}
    />
  );
}

export function popBar(props: { x?: number; y?: number; width?: number; height?: number; fill?: string }) {
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const width = props.width ?? 0;
  const height = props.height ?? 0;
  return <rect x={x} y={y - 8} width={width} height={height + 8} rx={3} fill={props.fill} />;
}

export function PopPie({
  data,
  dataKey,
  inner,
  outer,
  active,
  onActive,
  formatter,
}: {
  data: { name: string; fill: string }[];
  dataKey: string;
  inner: number | string;
  outer: number | string;
  active?: number;
  onActive: (i: number | undefined) => void;
  formatter?: (v: number) => string | number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey="name"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
          activeIndex={active}
          activeShape={popSlice}
          onMouseEnter={(_, i) => onActive(i)}
          onMouseLeave={() => onActive(undefined)}
        >
          {data.map((d, i) => (
            <RCell key={d.name} fill={d.fill} opacity={active == null || active === i ? 1 : 0.32} style={{ cursor: "pointer", outline: "none" }} />
          ))}
        </Pie>
        <Tooltip {...tip} formatter={formatter ? (v: number) => formatter(v) : undefined} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MixTrack({ pct, fill }: { pct: number; fill?: string }) {
  return (
    <span className="relative block h-3 w-full min-w-0 overflow-hidden rounded-sm bg-page">
      <i
        className="absolute inset-y-[3px] left-0 rounded-sm bg-muted transition-[top,bottom] duration-150 ease-out group-hover:inset-y-0"
        style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, background: fill }}
      />
    </span>
  );
}
