import { createIsomorphicFn } from "@tanstack/react-start";
import { DOCK_COOKIE, dockFromCookie, type Dock } from "./dock-cookie";

export type { Dock } from "./dock-cookie";

export const readDock = createIsomorphicFn()
  .server(async (): Promise<Dock> => {
    const { getCookie } = await import("@tanstack/react-start/server");
    return getCookie(DOCK_COOKIE) === "shut" ? "shut" : "open";
  })
  .client(async (): Promise<Dock> => dockFromCookie(document.cookie));
