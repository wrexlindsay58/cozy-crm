import { useTodayBoard } from "./useTodayBoard";
import { ShopFeed } from "@/features/today/feed";

export function VTodayBoard08({ bag }: { bag: ReturnType<typeof useTodayBoard> }) {
  const { feed, setFeed } = bag;
  return (
    <>
<ShopFeed open={feed} onOpen={() => setFeed(true)} onClose={() => setFeed(false)} />
    </>
  );
}
