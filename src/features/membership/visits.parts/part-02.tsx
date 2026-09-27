import { useState } from "react";
import { Plus } from "lucide-react";
import { Fact, FactGrid, FileBlock } from "@/features/record-shell/file-sheet";
import { namesIn, useStaff } from "@/features/staff/store";
import { PaymentTerminal } from "@/features/pay/terminal";
import { addVisit, bookMembershipVisit, payVisitRepair, memberPrice } from "../store";
import type { MembershipFile } from "../types";
import { field, clock, includedIds, posted } from "./part-01";
import { VisitCard } from "./part-04";

export function MembershipVisits({ file }: { file: MembershipFile }) {
  useStaff();
  const techs = namesIn("Crew", "PM");
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const used = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const booked = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && visit.status === "Set").length;
  const covered = includedIds(visits.filter((visit) => posted(visit)), file.visitsPerYear);
  const [charge, setCharge] = useState<{ visitId: string; repairId: string; amount: number; name: string } | null>(null);
  const [day, setDay] = useState("");
  const [time, setTime] = useState("09:00");
  const [tech, setTech] = useState(techs[0] ?? "");
  const [miss, setMiss] = useState(false);
  const active = file.status === "Active" || file.status === "Continued";
  const hours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

  return (
    <div className="space-y-4">
      <FileBlock
        title="This year"
        hint={`${file.visitsPerYear} included on ${file.planName}. A repair is not plan dues.`}
        aside={
          <button
            type="button"
            disabled={!active}
            title={active ? "Add a visit" : "The plan has to be active"}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-navy px-3 text-sm font-semibold text-card disabled:opacity-40"
            onClick={() => addVisit(file.id, techs[0] ?? "")}
          >
            <Plus className="h-4 w-4" />
            Visit
          </button>
        }
      >
        <FactGrid>
          <Fact label="Included" value={file.visitsPerYear} />
          <Fact label="Used" value={used} />
          <Fact label="On the book" value={booked} />
          <Fact label="Left" value={Math.max(0, file.visitsPerYear - used - booked)} />
        </FactGrid>
        <form
          className="grid gap-2 border-t border-line pt-3 sm:grid-cols-[1fr_8rem_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const result = bookMembershipVisit(file.id, { on: day, time, tech });
            setMiss(result !== "ok");
            if (result === "ok") setDay("");
          }}
        >
          <input type="date" aria-label="Visit date" value={day} onChange={(e) => setDay(e.target.value)} className={field} />
          <select aria-label="Visit time" value={time} onChange={(e) => setTime(e.target.value)} className={field}>
            {hours.map((hour) => (
              <option key={hour} value={hour}>
                {clock(hour)}
              </option>
            ))}
          </select>
          <select aria-label="Tech" value={tech} onChange={(e) => setTech(e.target.value)} className={field}>
            <option value="">Tech</option>
            {techs.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <button type="submit" disabled={!active} className="h-10 rounded-md border border-navy px-3 text-sm font-semibold text-navy disabled:opacity-40">
            On the book
          </button>
          {miss ? <p className="text-sm text-stop sm:col-span-4">Pick a date and a tech. The plan has to be active.</p> : null}
        </form>
      </FileBlock>
      {visits.map((visit) => (
        <VisitCard
          key={visit.id}
          file={file}
          visit={visit}
          techs={techs}
          included={covered.has(visit.id)}
          onCharge={(repair) => setCharge({ visitId: visit.id, repairId: repair.id, amount: memberPrice(repair.amount, file.repairDiscount), name: repair.name })}
        />
      ))}
      {!visits.length ? <p className="text-sm text-muted">No visits yet.</p> : null}
      {charge ? (
        <PaymentTerminal
          title={charge.name || "Visit repair"}
          amount={charge.amount}
          purpose={`Membership ${file.id} repair ${charge.repairId}`}
          vault={file.card?.vaultId ? { vaultId: file.card.vaultId, brand: file.card.brand, last4: file.card.last4, rail: file.card.rail } : undefined}
          onClose={() => setCharge(null)}
          onPaid={(slip) => {
            payVisitRepair(file.id, charge.visitId, charge.repairId, { brand: slip.brand || "Card", last4: slip.last4 || "", receipt: slip.receipt || "" });
            setCharge(null);
          }}
        />
      ) : null}
    </div>
  );
}
