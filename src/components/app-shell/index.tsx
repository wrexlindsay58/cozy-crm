import type { ReactNode } from "react";
import type { Dock } from "@/lib/dock-cookie";
import { AIStreamView } from "@/components/ai-stream-view";
import { useRealtimeSync } from "@/features/realtime/use-realtime-sync";
import { MobileBar } from "@/components/app-shell/mobile-bar";
import { MobileNavSheet } from "@/components/app-shell/mobile-sheet";
import { NavRail } from "@/components/app-shell/nav-rail";
import { ShellHeader } from "@/components/app-shell/shell-header";
import { useShell } from "@/components/app-shell/use-shell";

export function AppShell({ children, dock }: { children: ReactNode; dock: Dock }) {
  useRealtimeSync();
  const shell = useShell(dock);
  return (
    <div className="relative grid h-dvh w-full min-w-0 max-w-full grid-rows-[56px_minmax(0,1fr)] overflow-hidden bg-page text-ink">
      <ShellHeader mobileSearch={shell.mobileSearch} onMenu={shell.onMenu} onSearch={() => shell.setMobileSearch((v) => !v)} onCloseSearch={() => shell.setMobileSearch(false)} />
      <div className="relative flex min-h-0 min-w-0 overflow-hidden">
        {shell.mobileOpen ? (
          <MobileNavSheet
            pathname={shell.pathname}
            salesBoard={shell.salesBoard}
            pastDueN={shell.pastDueN}
            paperN={shell.paperN}
            onClose={() => shell.setMobileOpen(false)}
          />
        ) : null}
        <NavRail
          shut={shell.shut}
          pathname={shell.pathname}
          salesBoard={shell.salesBoard}
          pastDueN={shell.pastDueN}
          paperN={shell.paperN}
          onNavigate={() => shell.setMobileOpen(false)}
        />
        <div className="@container/main flex min-h-0 min-w-0 flex-1 flex-col overflow-x-clip overflow-y-auto overscroll-y-none max-md:pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
      <MobileBar pathname={shell.pathname} onSearch={shell.openSearch} />
      <AIStreamView />
    </div>
  );
}
