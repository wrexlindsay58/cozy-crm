import { JobLanes, MembershipCard, NewLeadCard } from "./jobs-leads";
import { PhotoGrid } from "./photos";
import { VisitBoard } from "./visits";
import type { AccountFile } from "./store";
import { FileSections } from "@/features/record-shell/file-sections";
import { PriorStages } from "@/features/record-shell/prior-stages";

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
    <FileSections
      sections={[
        { id: "jobs", label: "Jobs", node: <JobLanes file={file} lane={lane} onLane={onLane} /> },
        {
          id: "account",
          label: "Account",
          node: (
            <div className="grid gap-3 lg:grid-cols-2">
              <MembershipCard file={file} />
              <NewLeadCard file={file} open={leadOpen} />
            </div>
          ),
        },
        { id: "visits", label: "Visits", node: <VisitBoard file={file} open={bookOpen} /> },
        { id: "photos", label: "Photos", node: <PhotoGrid accountId={file.accountId} /> },
        { id: "pipeline", label: "Pipeline", node: <PriorStages leadId={file.leadId} current="account" /> },
      ]}
    />
  );
}
