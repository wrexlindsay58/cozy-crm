import type { SignedCheck, PermitFile, RebateFile, TestOut, LoanFile } from "./part-02";
import type { ClosingPacket } from "./part-03";

export function defaultPost(): SignedCheck {
  return {
    items: [
      { id: "walk", label: "Walkthrough done", on: false },
      { id: "stat", label: "Thermostat shown", on: false },
      { id: "debris", label: "Debris hauled", on: false },
      { id: "serial", label: "Serials on file", on: false },
      { id: "test", label: "Test-out numbers in", on: false },
      { id: "warr", label: "Warranty explained", on: false },
    ],
    signedBy: "",
    signedAt: "",
  };
}

export function defaultPacket(): ClosingPacket {
  return {
    sent: false,
    sentAt: "",
    parts: [
      { id: "agreement", label: "Signed agreement" },
      { id: "inv", label: "Paid invoice" },
      { id: "warr", label: "Labor warranty" },
      { id: "serial", label: "Serials / AHRI" },
      { id: "photos", label: "Before & after" },
      { id: "care", label: "Care sheet" },
      { id: "rebate", label: "Rebate forms" },
      { id: "permit", label: "Permit final" },
    ].map((p) => ({ ...p, on: false })),
  };
}

export function emptyPermit(): PermitFile {
  return { number: "", city: "", inspection: "", result: "None" };
}

export function emptyRebate(): RebateFile {
  return { utility: "", program: "", amount: 0, status: "None", reservation: "" };
}

export function emptyTest(): TestOut {
  return { blowerBefore: "", blowerAfter: "", ductBefore: "", ductAfter: "", notes: "", facts: {}, checks: {} };
}

export function cashLoan(): LoanFile {
  return { vendor: "Cash", amount: 0, dealerFee: 0, term: 0, rate: 0, status: "None", notes: "", fundedAmount: 0 };
}
