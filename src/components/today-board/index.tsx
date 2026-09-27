import { useTodayBoard } from "./useTodayBoard";
import { VTodayBoardRoot } from "./VTodayBoardRoot";

export function TodayBoard() {
  const bag = useTodayBoard();
  return <VTodayBoardRoot bag={bag} />;
}

export type TodayBoardBag = Parameters<typeof VTodayBoardRoot>[0]["bag"];

export * from "./bits-01";
export * from "./bits-02";
export * from "./bits-03";
export * from "./bits-04";
export * from "./bits-05";
export * from "./useTodayBoard";
export * from "./VTodayBoard01";
export * from "./VTodayBoard02";
export * from "./VTodayBoard03";
export * from "./VTodayBoard04";
export * from "./VTodayBoard05";
export * from "./VTodayBoard06";
export * from "./VTodayBoard07";
export * from "./VTodayBoard08";
export * from "./VTodayBoardRoot";
