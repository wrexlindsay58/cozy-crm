import { Link } from "@tanstack/react-router";
import { Bell, PanelLeft, Search } from "lucide-react";
import { CozyWordmark } from "@/components/cozy-mark";
import { Omnibox } from "@/features/search/omnibox";
import { ActorMenu } from "@/components/app-shell/actor-menu";
import { lateCount } from "@/components/app-shell/nav-data";

export function ShellHeader({
  mobileSearch,
  onMenu,
  onSearch,
  onCloseSearch,
}: {
  mobileSearch: boolean;
  onMenu: () => void;
  onSearch: () => void;
  onCloseSearch: () => void;
}) {
  return (
    <>
      <header className="z-30 grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/10 bg-navy pl-3 text-card md:pl-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onMenu} className="grid size-10 place-items-center rounded-md text-faint hover:bg-white/10 hover:text-card" aria-label="Toggle menu">
            <PanelLeft className="size-4" />
          </button>
          <Link to="/" preload="intent" className="flex h-10 items-center rounded-md bg-card px-2.5 shadow-[0_1px_2px_rgba(12,35,64,0.18)] ring-1 ring-black/5">
            <CozyWordmark className="h-[26px] w-[78px] md:h-[30px] md:w-[90px]" house="#C2162E" word="#0C2340" />
          </Link>
        </div>
        <div className="relative hidden w-full justify-center lg:flex">
          <div className="w-[70%] max-w-md min-w-48">
            <Omnibox inputId="cozy-search" />
          </div>
        </div>
        <div className="flex h-full items-center justify-end">
          <button type="button" className="grid size-10 place-items-center text-faint hover:text-card lg:hidden" aria-label="Search" onClick={onSearch}>
            <Search className="size-4" />
          </button>
          <Link to="/" hash="late" preload="intent" className="relative grid size-10 place-items-center text-faint hover:text-card" aria-label="Late">
            <Bell className="size-4" />
            {lateCount ? <span className="absolute top-1.5 right-1.5 grid h-4 min-w-4 place-items-center rounded-sm bg-stop px-0.5 text-[11px] font-bold text-card">{lateCount}</span> : null}
          </Link>
          <ActorMenu />
        </div>
      </header>
      {mobileSearch ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy lg:hidden">
          <div className="flex h-14 shrink-0 items-center justify-end px-3">
            <button type="button" className="h-11 px-2 text-sm font-semibold text-card" onClick={onCloseSearch}>
              Close
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-[env(safe-area-inset-bottom)]">
            <Omnibox compact screen inputId="cozy-search-mobile" onPick={onCloseSearch} />
          </div>
        </div>
      ) : null}
    </>
  );
}
