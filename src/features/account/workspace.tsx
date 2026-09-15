import { JobLanes, MembershipCard, NewLeadCard } from "./jobs-leads";
import { PhotoGrid } from "./photos";
import { VisitBoard } from "./visits";
import type { AccountFile } from "./store";

export function AccountWorkspace({
  file,
  bookOpen,
  leadOpen,
  lane,
  onLane,
}: {
  file: AccountFile;
  bookOpen: boolean;
  leadOpen: boolean;
  lane: string;
  onLane: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <JobLanes file={file} lane={lane} onLane={onLane} />
      <div className="grid gap-3 lg:grid-cols-2">
        <MembershipCard file={file} />
        <NewLeadCard file={file} open={leadOpen} />
      </div>
      <VisitBoard file={file} open={bookOpen} />
      <PhotoGrid accountId={file.accountId} />
    </div>
  );
}
