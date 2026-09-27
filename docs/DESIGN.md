# Design system

Cozy should look like a shop that has its books in order: navy, paper, one typeface, numbers that line up. Not a generic SaaS skin. Tokens ship in `src/styles/theme.css`, type in `src/styles/type.css`, chrome rules in `src/lib/chrome.ts`.

## Color tokens and surfaces

Light mode is what the app ships. Dark mode uses the **same custom properties** under `[data-theme="dark"]`. Do not invent a second set of utility names.

| Token                                | Light                 | Dark                  |
| ------------------------------------ | --------------------- | --------------------- |
| `--color-navy`                       | `#0b3a4d`             | `#7eb4c9`             |
| `--color-navy-2`                     | `#0f4a62`             | `#9cc6d6`             |
| `--color-navy-fg`                    | `#e8f1f4`             | `#071820`             |
| `--color-ink`                        | `#16323f`             | `#e8f1f4`             |
| `--color-muted`                      | `#3e5360`             | `#9bb0ba`             |
| `--color-faint`                      | `#5c7380`             | `#7d97a3`             |
| `--color-idle`                       | `#8aa0ab`             | `#6e8792`             |
| `--color-line`                       | `#d7e0e5`             | `#1e4454`             |
| `--color-line-strong`                | `#b7c5cd`             | `#2c5a6c`             |
| `--color-page`                       | `#e8eef1`             | `#071820`             |
| `--color-card`                       | `#ffffff`             | `#0f2c3a`             |
| `--color-go` / `--color-go-bg`       | `#1a6e45` / `#e3f2ea` | `#7dcea5` / `#123528` |
| `--color-watch` / `--color-watch-bg` | `#a34c08` / `#f6eadc` | `#e0a36a` / `#3a2814` |
| `--color-stop` / `--color-stop-bg`   | `#b01428` / `#f8e6e8` | `#f0a0aa` / `#3a1520` |

`go`, `watch`, and `stop` are **indicators only**. Never a chart fill, never a card background, never a primary bar. Gold, silver, and bronze are medals and stars only. No brown, sage, tan, black, or rainbow.

Radius: `--radius-sm` 4px, `--radius-md` 6px. Cards are `rounded-md bg-card`. The page is `bg-page`. Elevation is the hairline `--shadow-card` (`0 0 0 1px rgba(11, 58, 77, 0.08)`), not a stack of drop shadows. One surface step: page → card. Popovers sit on `bg-card` with `border-line`.

Typeface: IBM Plex Sans (`--font-sans`).

## Typography

Fluid styles are `clamp()` utilities in `src/styles/type.css`. Use the class. Do not pick a new size at the call site.

| Class           | Size                               | Use                             |
| --------------- | ---------------------------------- | ------------------------------- |
| `.type-page`    | `clamp(18px, 16px + 0.45vw, 22px)` | Screen title                    |
| `.type-section` | `clamp(16px, 15px + 0.25vw, 18px)` | Section                         |
| `.type-group`   | `clamp(15px, 14px + 0.15vw, 16px)` | Group                           |
| `.type-value`   | `clamp(13px, 12px + 0.15vw, 14px)` | Figures. Already `tabular-nums` |
| `.type-body`    | 13px                               | Reading copy                    |
| `.type-label`   | 11–12px, uppercase, muted          | Field labels                    |

Money, counts, percents, and rank use `tabular-nums` (`.tabular` or `.type-value`). A column of prices must not jitter when the number changes.

## Layout and the 4-stage shell

The shell collapses in four stages. Breakpoints are `NAV_COLLAPSE_PX = 1470` (`src/lib/chrome.ts`), `1023px` (`use-shell.ts`), and Tailwind `md` (768px).

| Width       | Chrome                                                                  |
| ----------- | ----------------------------------------------------------------------- |
| > 1470px    | Full left sidebar, labels visible                                       |
| 1024–1470px | Icon rail. Tooltips on the right. Card rows stay wide                   |
| 768–1023px  | Header drawer for nav and search. No persistent rail                    |
| < 768px     | Sticky bottom nav (`mobile-bar.tsx`, `md:hidden`) plus the bottom sheet |

Main content is a container: `@container/main` on the shell scroller. Components that care about their own width use `@container`, not the viewport. Example already in the tree: `@container main (max-width: 480px)` in `src/styles/metric.css`. A card that reflows inside a split pane must query the container, because the viewport can be wide while the pane is narrow.

Conversations stay 60/40 on a wide screen (`md:w-[clamp(18rem,34%,40rem)]`). Composer stays one row: templates, values, and emoji live in the menu, not in extra chrome.

## Components

**Table to card.** `RecordTable` renders `CardList` below 768px (`md:hidden`) and `DesktopTable` from 768px up (`hidden md:block`). New lists go through `RecordTable`. Do not ship a second table that only works on a laptop.

**44px targets.** `TAP = 44`. Every button, icon button, and row action hits 44px on the axis you tap. If the label would clip, drop the word and keep the icon plus a tooltip (`src/components/tip.tsx`). The word is not optional when there is room.

**Focus.** `:focus-visible` is a 2px navy ring, 2px offset (`src/styles/layout.css`). Do not remove it. Do not replace it with a color-only change. Icon-only controls need an accessible name.

**Actions.** Tickets, tasks, and requests live on the card. No popup for comment, reply, status, or attach. Owner edits the title. Anyone on the file can comment. Internal is the shop log. Customer is the house.
