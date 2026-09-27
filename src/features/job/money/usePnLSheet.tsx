import { marginGrade } from "./bits-01";
import { tally } from "../store";
import type { JobFile } from "../store";
import { bomJobCost } from "../types";
import { useMembershipFor } from "@/features/membership/store";

export function usePnLSheet({ job, readOnly = false }: { job: JobFile; readOnly?: boolean }) {
const t = tally(job);

const member = useMembershipFor(job.personId);

const held = member && member.pay === "prepaid" && (member.funding === "job" || member.funding === "loan") ? member : null;

const of = t.revenue;

const products = job.scope.filter((s) => s.kind === "product");

const adders = job.scope.filter((s) => s.kind === "adder");

const discounts = job.scope.filter((s) => s.kind === "discount" || s.amount < 0);

const cos = job.changeOrders.filter((c) => c.lane !== "finance" && c.status === "Approved" && c.signed);

const productAmt = products.reduce((s, r) => s + r.amount, 0);

const adderAmt = adders.reduce((s, r) => s + r.amount, 0);

const discAmt = discounts.reduce((s, r) => s + Math.abs(r.amount), 0);

const coAmt = cos.reduce((s, c) => s + c.amount, 0);

const fee = job.loan.vendor === "GoodLeap" ? job.loan.dealerFee : 0;

const bom = job.scope.flatMap((s) =>
    s.bom.map((b) => ({
      id: `${s.id}-${b.id}`,
      name: b.name,
      qty: b.usedQty || b.orderQty || b.estQty,
      cost: bomJobCost(b),
    })),
  );

const shares = job.commissions?.length
    ? job.commissions
    : [{ id: "CM-seed", who: job.closer, role: "Closer" as const, pct: t.trueDiscount.rate, paid: false }];

const closerN = Math.max(1, shares.filter((c) => c.role !== "Setter").length);

const grade = marginGrade(of ? t.gross / of : 0);
  return { job, readOnly, t, member, held, of, products, adders, discounts, cos, productAmt, adderAmt, discAmt, coAmt, fee, bom, shares, closerN, grade };
}
