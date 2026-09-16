import type { BookType } from "./types";

export const TYPE_TONE: Record<BookType, { bg: string; bar: string }> = {
  Sales: { bg: "#d7e8ef", bar: "#0b3a4d" },
  Assessment: { bg: "#cfe0ea", bar: "#0f4a62" },
  Callback: { bg: "#e2e8eb", bar: "#3e5360" },
  "Ride-along": { bg: "#efe3d4", bar: "#b45309" },
  Install: { bg: "#f4d9de", bar: "#c2162e" },
  "Pre-install": { bg: "#f8e6e8", bar: "#c2162e" },
  Service: { bg: "#d7eee2", bar: "#1f7a4d" },
  Warranty: { bg: "#e3f2ea", bar: "#1f7a4d" },
  "Go-back": { bg: "#f6eadc", bar: "#b45309" },
  "Test-out": { bg: "#dce8f4", bar: "#0b3a4d" },
  Punch: { bg: "#efe3d4", bar: "#8a5a20" },
  Dump: { bg: "#e8eef1", bar: "#5c7380" },
  Permit: { bg: "#f6eadc", bar: "#b45309" },
  Inspection: { bg: "#d4e4ee", bar: "#0b3a4d" },
  Materials: { bg: "#d7eee2", bar: "#1f7a4d" },
  Membership: { bg: "#e3f2ea", bar: "#0b3a4d" },
  Office: { bg: "#e8eef1", bar: "#16323f" },
  Training: { bg: "#dce8f4", bar: "#0f4a62" },
  "Time-off": { bg: "#eef2f4", bar: "#8aa0ab" },
  Open: { bg: "#ffffff", bar: "#b7c5cd" },
};
