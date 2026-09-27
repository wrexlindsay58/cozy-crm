import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Tip } from "@/components/tip";
import { BOARDS } from "@/features/leaderboard/catalog";
import { asMetric, mapsFor, retireRace, setEntered, useBoards, useDefinitions } from "@/features/leaderboard/define";
import { compatible, customerBoard, groupRow, isPlace, placeOf } from "@/features/leaderboard/fields";
import { removeCustom, useCustomBoards } from "@/features/leaderboard/custom";
import { rankOffices, rankPeriod } from "@/features/leaderboard/rank";
import { useStaff } from "@/features/staff/store";
import type { RangeId } from "@/lib/sales-data";
import { fillPeriod, choicesFor } from "./part-01";
import { Tile } from "./part-02";
import { LeaderboardView3 } from "./part-06";

export function Leaderboard() {
  const { actorName, viewAs, perms } = useStaff();
  const canDefine = Boolean(perms[viewAs]?.editCatalog);
  const customs = useCustomBoards();
  const { positions, races } = useDefinitions();
  const [range, setRange] = useState<RangeId>("day");
  const pages = useBoards();
  const [boardId, setBoardId] = useState("people");
  const [office, setOffice] = useState("all");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [addingPosition, setAddingPosition] = useState(false);
  const [addingBoard, setAddingBoard] = useState(false);
  const [mapping, setMapping] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>({});

  const active = pages.find((page) => page.id === boardId) ?? pages[0];

  const wall = useMemo(() => {
    const extra = (id: string) => races.filter((race) => race.positionId === id && !race.retired).map(asMetric);
    return [
      ...BOARDS.map((board) => ({ ...board, page: board.page ?? "people", metrics: [...board.metrics, ...extra(board.id)] })),
      { ...customerBoard(), metrics: [...customerBoard().metrics, ...extra("customers")] },
      ...positions.map((position) => ({
        id: position.id,
        label: position.name,
        who: position.page === "partners" ? "partner" : position.page === "customers" ? "customer" : "person",
        page: position.page ?? "people",
        people: position.people,
        metrics: extra(position.id),
      })),
    ];
  }, [positions, races]);

  const shown = useMemo(() => {
    return wall.flatMap((board) => {
      const row = groupRow(board.page);
      if (!mapsFor(board.id, board.page).includes(active.id) || !compatible(row, active.row) || !board.metrics.length) return [];
      const choices = choicesFor(board, customs, races);
      const pick = choices.find((choice) => choice.id === picks[board.id]) ?? choices[0];
      if (!pick) return [];
      return [{ key: board.id, position: board.label, title: pick.label, board, metric: pick.metric, who: pick.who, customId: pick.customId, raceId: pick.raceId, entered: pick.entered, choices, choice: pick.id, offices: isPlace(active.row) }];
    });
  }, [active.id, active.row, customs, picks, races, wall]);
  const openSpec = shown.find((s) => s.key === openKey?.split("::")[0]);
  const openName = openKey?.split("::")[1] ?? null;
  const period = openSpec?.metric.periods.find((p) => p.id === range) ?? openSpec?.metric.periods[0];
  const roll = isPlace(active.row) ? (officeName: string) => placeOf(officeName, active.row) : undefined;
  const openRoster = openSpec ? (openSpec.who ? openSpec.board.people.filter((p) => openSpec.who?.includes(p.name)) : openSpec.board.people) : [];
  const memberRoster = roll ? openRoster.map((person) => ({ ...person, office: roll(person.office) })) : openRoster;
  const filled = openSpec && period ? (openSpec.metric.id.startsWith("RC-") || openSpec.metric.id.startsWith("customers:") ? period : fillPeriod(period, openRoster, openSpec.metric)) : null;
  const members = openSpec?.offices && filled && openName ? rankPeriod(filled, memberRoster, openName, Boolean(openSpec.metric.fewest), openSpec.metric.min).filter((r) => r.rank > 0) : undefined;
  const openRow = openSpec && filled
    ? (openSpec.offices ? rankOffices(filled, memberRoster, Boolean(openSpec.metric.fewest), openSpec.metric.kind === "pct" || openSpec.metric.kind === "days", openSpec.metric.min) : rankPeriod(filled, openRoster, office, Boolean(openSpec.metric.fewest), openSpec.metric.min)).find((r) => r.name === openName)
    : null;

  useEffect(() => {
    setOpenKey(null);
  }, [range, office, boardId]);

  const offices = [{ id: "all", label: "All offices" }, ...Array.from(new Set(BOARDS.flatMap((b) => b.people.map((p) => p.office)))).map((id) => ({ id, label: id }))];

  return (
    <LeaderboardView3 bag={{ active, setBoardId, pages, office, setOffice, offices, query, setQuery, canDefine, setOpenKey, setAddingBoard, setAddingPosition, range, setRange, shown, actorName, setPicks, openKey, openName, setAdding, setMapping, positions, openSpec, openRow, members, adding, wall, addingPosition, addingBoard, mapping }} />
  );
}

export function LeaderboardView(props: { bag: { shown: any; range: any; office: any; query: any; actorName: any; active: any; setPicks: any; setOpenKey: any; openKey: any; openName: any; canDefine: any; setAdding: any; setMapping: any; positions: any } }) {
  const { shown, range, office, query, actorName, active, setPicks, setOpenKey, openKey, openName, canDefine, setAdding, setMapping, positions } = props.bag;
  return (
    <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((spec: any) => (
            <Tile
              key={spec.key}
              position={spec.position}
              title={spec.title}
              board={spec.board}
              metric={spec.metric}
              range={range}
              office={spec.offices ? "all" : office}
              query={query}
              who={spec.who}
              you={actorName}
              offices={spec.offices}
              rollup={spec.offices ? (officeName) => placeOf(officeName, active.row) : undefined}
              choices={spec.choices}
              choice={spec.choice}
              entered={spec.entered}
              locked={Boolean(spec.entered && range !== "day")}
              onChoice={(id) => {
                setPicks((cur: any) => ({ ...cur, [spec.board.id]: id }));
                setOpenKey(null);
              }}
              open={openKey === `${spec.key}::${openName}` ? openName : null}
              onOpen={(name) => setOpenKey(`${spec.key}::${name}`)}
              onScore={spec.entered && spec.raceId && range === "day" ? (name, score, n) => setEntered(spec.raceId!, "day", name, score, n) : undefined}
              onRetire={canDefine && spec.raceId && !spec.offices ? () => { retireRace(spec.raceId!); setPicks((cur: any) => ({ ...cur, [spec.board.id]: spec.board.metrics[0]?.id ?? "" })); } : undefined}
              onAdd={canDefine ? () => setAdding(spec.board.id) : undefined}
              onMap={canDefine ? () => setMapping(spec.board.id) : undefined}
              onRemove={
                spec.customId
                  ? () => {
                      removeCustom(spec.customId!);
                      setPicks((cur: any) => ({ ...cur, [spec.board.id]: spec.board.metrics[0].id }));
                      if (openKey?.startsWith(`${spec.key}::`)) setOpenKey(null);
                    }
                  : undefined
              }
            />
          ))}
          {positions
            .filter((position: any) => mapsFor(position.id, position.page).includes(active.id) && !shown.some((spec: any) => spec.key === position.id))
            .map((position: any) => (
              <section key={position.id} className="border border-line bg-card">
                <header className="flex h-14 items-center justify-between gap-2 px-3">
                  <h2 className="truncate text-[13px] font-semibold">{position.name}</h2>
                  {canDefine ? (
                    <Tip label="Add race" on>
                      <button type="button" aria-label="Add race" onClick={() => setAdding(position.id)} className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink">
                        <Plus className="size-4" />
                      </button>
                    </Tip>
                  ) : null}
                </header>
                <p className="px-3 py-6 text-[13px] text-muted">No races on this group.</p>
              </section>
            ))}
        </div>
      </div>
  );
}
