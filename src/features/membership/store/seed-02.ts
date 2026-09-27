import { membershipSeeds, readyAgreement } from "./seed";
import { getBrand } from "@/features/brand/store";
import { planById } from "../catalog";
import type { MembershipFile } from "../types";
import { memberAgreement } from "../agreement";

export function decorateMembership(seed: (typeof membershipSeeds)[number]): MembershipFile {
  const file = { ...seed, included: planById(seed.planId).included, repairDiscount: planById(seed.planId).repairDiscount };
  if (file.id === "M-101") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Ann Whitaker", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Visa" as const, last4: "4242", exp: "08/28", name: "Ann Whitaker" },
      ledger: [{ id: "M-101-1", at: "Mar 1, 2026", amount: 936, status: "Paid" as const, note: "Prepaid on the membership." }],
      visits: [
        {
          id: "V-101",
          on: "2026-06-12",
          tech: "Luis Cruz",
          did: "Changed the filter. Checked the charge and the drain.",
          parts: [{ id: "VP-101", name: "20x25x1 filter", qty: 1 }],
          checks: [
            { id: "VC-101", label: "Filter", done: true },
            { id: "VC-102", label: "System check", done: true },
            { id: "VC-103", label: "Drain", done: true },
          ],
          customerNote: "Upstairs is fine. The hall bath is slow to cool.",
          serviceNote: "Charge is in range. Drain was clear.",
          failing: "Hall bath supply is weak. Not failed yet.",
          repairs: [],
          status: "Done",
          postedBy: "Luis Cruz",
          postedAt: "Jun 12, 2026",
        },
      ],
    };
  }
  if (file.id === "M-102") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Alyssa Cho", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Mastercard" as const, last4: "5512", exp: "02/27", name: "Alyssa Cho" },
      ledger: [
        { id: "M-102-1", at: "Sep 22, 2026", amount: 54, status: "Paid" as const, note: "September." },
        { id: "M-102-2", at: "Oct 22, 2026", amount: 54, status: "Open" as const, note: "October." },
      ],
    };
  }
  if (file.id === "M-104") {
    return {
      ...file,
      agreement: { status: "Signed" as const, at: file.start, signer: "Diane Kerr", body: memberAgreement(file, getBrand().name) },
      card: { brand: "Visa" as const, last4: "1881", exp: "11/27", name: "Diane Kerr" },
      ledger: [
        { id: "M-104-1", at: "Sep 1, 2026", amount: 32, status: "Paid" as const, note: "September." },
        { id: "M-104-2", at: "Oct 1, 2026", amount: 32, status: "Open" as const, note: "October." },
      ],
    };
  }
  return {
    ...file,
    agreement: file.status === "Active" ? { status: "Signed" as const, at: file.start, signer: file.name, body: memberAgreement(file, getBrand().name) } : readyAgreement(file),
    ledger: [
      {
        id: `${file.id}-1`,
        at: file.start,
        amount: file.termPrice,
        status: file.funding === "loan" && file.status !== "Active" ? ("Held" as const) : file.pay === "prepaid" ? ("Paid" as const) : ("Open" as const),
        note: file.funding === "loan" ? "Included in the loan. Not job revenue." : file.pay === "prepaid" ? "Prepaid on the membership." : "Monthly bill.",
      },
    ],
  };
}
