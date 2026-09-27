import type { SignedCheck } from "../part-02";

export function defaultPre(): SignedCheck {
  return {
    items: [
      { id: "access", label: "Access confirmed", on: false },
      { id: "hoa", label: "HOA / dumpster ok", on: false },
      { id: "pets", label: "Pets secured", on: false },
      { id: "scope", label: "Scope reviewed with homeowner", on: false },
      { id: "photos", label: "Existing photos on file", on: false },
      { id: "util", label: "Utilities located", on: false },
    ],
    signedBy: "",
    signedAt: "",
  };
}
