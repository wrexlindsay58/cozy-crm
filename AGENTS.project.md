# Cozy CRM — project memory

Home-performance contractor CRM for owners in the **$500k–$3M** range (must scale to $100M). Demo company is Cozy. GitHub: `wrexlindsay58/cozy-crm`. Preview on **8080**. Speak in shop language, not SaaS.

## Who it is for

Trades owners who are time-poor and less software-native than other industries. Easy on the surface, deep underneath. Must make a small shop look established. Track the whole customer journey: lead in → job closed → account → next sale.

## Pipeline (do not collapse this)

1. **Lead** = contact + property + talk + book + transfer + drop + merge. No product price yet.
2. **Assessment** = site details + category packets (photos, notes, measurements). Categories live in settings.
3. **Opportunity** = a proposal exists. Options, adders, discounts, payment, generate proposal.
4. **Job** = sold work: schedule, crews, materials, costs, quality, GoodLeap, invoices, WOs, change orders, checklists, P&L.
5. **Account** = closed jobs, warranty, memberships, callbacks. New work from an account starts a **new lead** and later merges history.

Same record chrome on every stage: customer thread, Internal, Notes, History, Media & Files, Actions (tickets/tasks/requests), tags, workflows, DND, book, call/text/email.

Lead is the design reference. Later stages show prior-stage data collapsed.

## Design system (non-negotiable)

Tokens in `src/styles.css`: navy `#0b3a4d`, navy-2, ink, muted, faint, idle `#8aa0ab`, line, line-strong, page `#e8eef1`, card white.

- **go / watch / stop** (green / amber / red) are **indicators only** — never chart fills, never a card color, never a main bar.
- Gold / silver / bronze only on medals / stars.
- Cards: `rounded-md bg-card`. Page: `bg-page`. Labels: 11px bold uppercase muted. Numbers: 28–36px tabular.
- No brown, sage, tan, black, or rainbow. No AI-voice copy ("Path", "Street", "On the book" as flavor).
- Buttons: icons + tooltips when space is tight. Sidebar collapse + icon-only + tooltips.
- Conversations 60/40 on wide screens. Composer + dropdown (templates, custom values, emojis) — no extra vertical chrome.

## Nav

Daily: Today (Live Board, red pip), Inbox, Book, Map, Actions (`/tickets`).  
Pipeline: Leads, Appointments, Assessments, Opportunities, Jobs, Accounts.  
Money: Sales (`/scoreboard`), Invoices, Purchasing.  
Company: Leaderboard, Crews, Team, Reports, Settings.

Today is **live ops** (now + rest of today). Sales is a **period dashboard** (LTD/YTD/QTD/MTD/WTD/Day). They must not look like clones.

## Pages that matter

- **Lead / Assessment / Opportunity / Job / Account**: `src/features/record-shell/` + stage workspaces. Job flow: `src/features/job/`. Proposal: `src/features/opportunity/proposal-*.tsx` (Teko / Oswald / sans, Cozy navy+red+gray, HTML present, send link/PDF).
- **Actions**: `/tickets` is a split queue — fat list (~50%) + talk pane with the same lead tabs (Customer, Internal, Notes, Tags, Actions, History, Media, Book, Form last), scoped to the action. Media is files on this action (View all on the house). Book schedules the house for this action. Details rail on wide screens. Three kinds nest. View all stays in the pane. `/tickets/$actionId` is the same page with that card selected.
- **Inbox**: `src/components/conversations.tsx`.
- **Book**: `src/features/book/` — single event store, resource / 3-day / week / month. 6am start for crews, 8am for sales. Google-style overlay stacking. Popup compose (not bottom drawer).
- **Map / dispatch**: `src/components/dispatch-map.tsx` + `src/features/dispatch/` — MapLibre, light Cozy style (not black, not positron-washed), OSRM street routes, tied to Book day.
- **Live Board**: `src/components/today-board.tsx` + `src/features/today/live.ts`. Daily stats, pips vs **this hour yesterday**, goal ticks, muted/steel charts, navy only for now/live/goal-beat.
- **Sales**: `src/components/sales-dashboard.tsx` + `src/lib/sales-data.ts`. Same tokens. Distinct layout. Close = donut. Mix cards have `$` / Qty / % toggles. Payment donut with **Revenue / Quantity / %**. NSA + avg ticket. Closer medals + rank by Overall / Sold / Qty / Close / NSA / Avg. Filters: market + people. Vs labels are same-window prior (YTD = last year this time, Day = yesterday this hour).
- **Settings / Reports**: large, settings-first. Product & pricing is dynamic option logic, not hardcoded HVAC/solar SKUs. No Salesforce. No roof-only or inverter catalogs.

## Payment types (sales)

Cash/check (one bucket), Cash/check + financing, CC, CC + financing, ACH, ACH + financing.

## What not to do

- Do not make Sales a Live Board copy.
- Do not flood navy or traffic-light charts.
- Do not put price/product on a raw lead as sold value.
- Do not invent extra npm deps; Recharts is already in.
- Do not drop pipeline communication (internal nested threads, reactions on hover/hold, call recordings in the thread).
- Commit/push only when asked. Vercel: repo `wrexlindsay58/cozy-crm`. GitHub app may need grant for auto deploys.

## Next likely work

Action Center is in. Then other Money pages, remaining settings vs Odin-CRM, job/calendar remaining holes, deploy.
