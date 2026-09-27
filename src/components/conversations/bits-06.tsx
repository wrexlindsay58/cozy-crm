import { Lane } from "./bits-01";
import { ConvTabs } from "@/features/record-shell/conv-tabs";

export function LaneHead({ lane, onLane }: { lane: Lane; onLane: (v: Lane) => void }) {
  return <ConvTabs lane={lane} onLane={(id) => onLane(id as Lane)} />;
}
