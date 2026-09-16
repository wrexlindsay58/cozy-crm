import { useSyncExternalStore, type CSSProperties } from "react";

export type Brand = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  web: string;
  license: string;
  city: string;
  hours: string;
  logo: string;
  red: string;
  navy: string;
  black: string;
  gray: string;
  paper: string;
  ink: string;
  fontHead: string;
  fontSub: string;
  fontBody: string;
};

const seed: Brand = {
  name: "Cozy Home Performance",
  tagline: "Love coming home",
  phone: "(480) 555-0100",
  email: "hello@cozyhome.com",
  web: "cozyhome.com",
  license: "ROC 312884",
  city: "Scottsdale, AZ",
  hours: "Mon–Sat 8a–6p",
  logo: "/brand/cozy-logo.png",
  red: "#C8102E",
  navy: "#12344A",
  black: "#0A0A0A",
  gray: "#6E6E6E",
  paper: "#FFFFFF",
  ink: "#121212",
  fontHead: "Teko",
  fontSub: "Oswald",
  fontBody: "IBM Plex Sans",
};

let brand: Brand = { ...seed };
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
export function useBrand() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => brand,
    () => brand,
  );
}
export function getBrand() {
  return brand;
}
export function setBrand(patch: Partial<Brand>) {
  brand = { ...brand, ...patch };
  emit();
}
export function brandVars(b: Brand = brand): CSSProperties {
  return {
    ["--p-red" as string]: b.red,
    ["--p-navy" as string]: b.navy,
    ["--p-black" as string]: b.black,
    ["--p-gray" as string]: b.gray,
    ["--p-paper" as string]: b.paper,
    ["--p-ink" as string]: b.ink,
    ["--p-head" as string]: `'${b.fontHead}', Impact, sans-serif`,
    ["--p-sub" as string]: `'${b.fontSub}', 'Arial Narrow', sans-serif`,
    ["--p-body" as string]: `'${b.fontBody}', ui-sans-serif, sans-serif`,
    fontFamily: `var(--p-body)`,
    color: b.ink,
    background: b.paper,
  };
}
