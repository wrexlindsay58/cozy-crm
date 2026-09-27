import { addBoard, addPosition, addRace, mapsFor, setGroupBoards } from "@/features/leaderboard/define";
import { BoardSheet, MapSheet, PositionSheet, RaceSheet } from "@/features/leaderboard/define-sheet";
import { groupRow } from "@/features/leaderboard/fields";
import { RankDrawer } from "@/features/leaderboard/drawer";
import { LeaderboardView } from "./part-03";
import { LeaderboardView2 } from "./part-04";

export function LeaderboardView3(props: { bag: { active: any; setBoardId: any; pages: any; office: any; setOffice: any; offices: any; query: any; setQuery: any; canDefine: any; setOpenKey: any; setAddingBoard: any; setAddingPosition: any; range: any; setRange: any; shown: any; actorName: any; setPicks: any; openKey: any; openName: any; setAdding: any; setMapping: any; positions: any; openSpec: any; openRow: any; members: any; adding: any; wall: any; addingPosition: any; addingBoard: any; mapping: any } }) {
  const { active, setBoardId, pages, office, setOffice, offices, query, setQuery, canDefine, setOpenKey, setAddingBoard, setAddingPosition, range, setRange, shown, actorName, setPicks, openKey, openName, setAdding, setMapping, positions, openSpec, openRow, members, adding, wall, addingPosition, addingBoard, mapping } = props.bag;
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-page">
      <LeaderboardView2 bag={{ active, setBoardId, pages, office, setOffice, offices, query, setQuery, canDefine, setOpenKey, setAddingBoard, setAddingPosition, range, setRange }} />
      <LeaderboardView bag={{ shown, range, office, query, actorName, active, setPicks, setOpenKey, openKey, openName, canDefine, setAdding, setMapping, positions }} />
      {openSpec && openRow ? <RankDrawer row={openRow} metric={openSpec.metric} range={range} members={members} onClose={() => setOpenKey(null)} /> : null}
      {adding ? (
        <RaceSheet
          position={wall.find((board: any) => board.id === adding)?.label ?? "Group"}
          row={groupRow(wall.find((board: any) => board.id === adding)?.page)}
          names={(wall.find((board: any) => board.id === adding)?.metrics ?? []).map((metric: any) => metric.label)}
          onClose={() => setAdding(null)}
          onSave={(race) => {
            const positionId = adding;
            const id = addRace({ ...race, positionId });
            setPicks((cur: any) => ({ ...cur, [positionId]: id }));
            setAdding(null);
          }}
        />
      ) : null}
      {addingPosition ? (
        <PositionSheet
          page={active.row === "partner" ? "partners" : active.row === "customer" ? "customers" : "people"}
          current={active.id}
          pages={pages}
          names={wall.map((board: any) => board.label)}
          groups={wall.filter((board: any) => (board.page ?? "people") === (active.row === "partner" ? "partners" : active.row === "customer" ? "customers" : "people")).map((board: any) => ({ label: board.label, people: board.people }))}
          onClose={() => setAddingPosition(false)}
          onSave={(row) => {
            const made = addPosition(row);
            setPicks((cur: any) => ({ ...cur, [made.positionId]: made.raceId }));
            if (row.boards[0]) setBoardId(row.boards.includes(active.id) ? active.id : row.boards[0]);
            setAddingPosition(false);
          }}
        />
      ) : null}
      {addingBoard ? (
        <BoardSheet
          names={pages.map((page: any) => page.name)}
          onClose={() => setAddingBoard(false)}
          onSave={(row) => {
            setBoardId(addBoard(row));
            setAddingBoard(false);
          }}
        />
      ) : null}
      {mapping ? (
        <MapSheet
          group={wall.find((board: any) => board.id === mapping)?.label ?? "Group"}
          row={groupRow(wall.find((board: any) => board.id === mapping)?.page)}
          pages={pages}
          selected={mapsFor(mapping, wall.find((board: any) => board.id === mapping)?.page)}
          onClose={() => setMapping(null)}
          onSave={(boards) => {
            setGroupBoards(mapping, boards);
            setMapping(null);
          }}
        />
      ) : null}
    </div>
  );
}
