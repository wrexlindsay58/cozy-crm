import { useEffect, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { NAV_COLLAPSE_PX, liveStatus } from "@/lib/chrome";
import { dockCookieValue, type Dock } from "@/lib/dock-cookie";
import { useOps } from "@/features/ops/store";
import { useJobs } from "@/features/job/store";
import { useProposals } from "@/features/opportunity/store";
import { paperAlertCount } from "@/features/paper/model";

const NARROW = "(max-width: 1023px)";

export function useShell(dock: Dock) {
  const [collapsed, setCollapsed] = useState(dock === "shut");
  const [forceOpen, setForceOpen] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const salesBoard = useRouterState({ select: (s) => (s.location.search as { board?: string }).board === "sales" });
  const { actions, leads } = useOps();
  const jobs = useJobs();
  const proposals = useProposals();
  const pastDueN = actions.filter((a) => liveStatus(a.status, a.due) === "Past Due").length;
  const paperN = useMemo(() => paperAlertCount(Object.values(jobs), Object.values(proposals), leads), [jobs, proposals, leads]);
  const shut = autoCollapse ? !forceOpen : collapsed;

  useEffect(() => {
    try {
      if (!document.cookie.split(";").some((part) => part.trim().startsWith("cozy-nav="))) {
        const legacy = localStorage.getItem("cozy-nav");
        if (legacy === "1" || legacy === "0") {
          document.cookie = dockCookieValue(legacy === "1" ? "shut" : "open");
          localStorage.removeItem("cozy-nav");
        }
      }
    } catch {
      /* private mode */
    }
    const mq = window.matchMedia(`(max-width: ${NAV_COLLAPSE_PX}px)`);
    function apply() {
      setAutoCollapse(mq.matches);
      if (!mq.matches) setForceOpen(false);
    }
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (window.matchMedia(NARROW).matches) {
        setMobileSearch(true);
        requestAnimationFrame(() => document.getElementById("cozy-search-mobile")?.focus());
        return;
      }
      document.getElementById("cozy-search")?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggle() {
    if (autoCollapse) {
      setForceOpen((v) => !v);
      return;
    }
    setCollapsed((c) => {
      const next = !c;
      document.cookie = dockCookieValue(next ? "shut" : "open");
      try {
        localStorage.removeItem("cozy-nav");
      } catch {
        /* private mode */
      }
      return next;
    });
  }

  function onMenu() {
    if (window.matchMedia(NARROW).matches) {
      setMobileOpen((o) => !o);
      return;
    }
    toggle();
  }

  return {
    shut,
    pathname,
    salesBoard,
    pastDueN,
    paperN,
    mobileOpen,
    setMobileOpen,
    mobileSearch,
    setMobileSearch,
    onMenu,
  };
}
