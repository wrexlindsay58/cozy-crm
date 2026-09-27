export type Dock = "open" | "shut";

export const DOCK_COOKIE = "cozy-nav";

export function dockFromCookie(header: string | undefined | null): Dock {
  if (!header) return "open";
  const hit = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${DOCK_COOKIE}=`));
  return hit?.slice(DOCK_COOKIE.length + 1) === "shut" ? "shut" : "open";
}

export function dockCookieValue(dock: Dock) {
  return `${DOCK_COOKIE}=${dock}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
