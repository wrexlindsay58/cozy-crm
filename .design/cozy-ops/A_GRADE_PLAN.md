# A-grade plan. Every page.

Date: 15 Sep 2026
Rule: a page is not an A until the Done-when list is ticked in a browser, on desktop and on 390px.
Demo writes count. Dead labels do not. "Next batch" copy fails the page.

## What A means (same bar on every screen)

1. Job of the page is obvious in 8 seconds. No subtitle essay.
2. Primary content is names, times, money. Not tiles that need a legend.
3. Every button does what it says. Call writes a call. Take card writes a payment. Filter matches seed data.
4. Full pane on lists and boards. No 80rem cage. Sticky name. Row tap >= 44px on the phone.
5. One tap from a name to the file. Count cards drill to names, then to the file.
6. Empty state: what is missing, what to tap. Two lines.
7. Customer | Internal on every file. History of every write.
8. Change in Settings shows on this page the same minute, or the setting does not belong.
9. Looks like a $20M shop on anything the homeowner sees. Office screens stay dull and fast.

A is not live Twilio, live GoodLeap, live GPS, or live Odin. Those are A-plus, later, same buttons.

---

## Now vs A, by page

### Daily

| Page | Now | A looks like | Gaps |
|---|---|---|---|
| Today `/` | B | Late names first (unmarked, no-sit, not called, holds, tickets). Tonight with time, closer, city. Cash in vs out. Each row opens the file. Mark from the row (called / confirmed) writes. Crew strip is live from job assign. | Row actions. Cash tied to invoices/POs. Crew from job store. Drop the helper sentence under the title. |
| Inbox `/conversations` | C- | Two tabs: Customer, Internal. Unread first. Thread on the right (desktop) or full screen (phone). Composer. Log call from the thread. From-number in the header. Open file from the name. Templates. | Split pane. Call log. From-number. Templates. Unread that writes. Internal not mixed in. |
| Book `/calendar` | C | People as columns, hours as rows, duration is height. Filter: runs / installs / all. Click a block: confirm, reschedule, disposition, open file. Drag on desktop writes time. Empty morning is empty, not broken. Month view is secondary. | Wired to ops appointments + job windows. Drag write. Disposition from the block. Full width. |
| Map `/dispatch` | C | Pins = tonight + installs + late. Color is late vs on-time. Click pin: name, time, closer/crew, open file, assign. Late list beside the map on desktop, under it on the phone. Assign from a job moves the pin. | Pins from the same stores as Book and Jobs. Assign writes. No decorative map. |

### Pipeline lists (shared A)

All of: Leads, Appointments, Assessments, Opportunities, Jobs, Accounts.

A: full pane, sticky name, sticky header, column picker, saved views, search = header search (name, phone, address, id), filters that match real statuses, last touch, $, who, office, next. Row opens the file. New button is fat on the phone. Empty filter says "No unmarked leads" + Clear.

| Page | Now | Extra for A |
|---|---|---|
| Leads | D+ | New lead (name+phone). Views: Unmarked, My book, Phoenix, Not called, Age > 3d. Statuses match seed (`Set, no run`). |
| Appointments | D+ | Day chips. Unmarked first. Confirm / no-sit from the row. |
| Assessments | D+ | Open vs complete. Closer. Packet progress `3/5`. |
| Opportunities | D+ | Stage: draft / sent / signed / won. GoodLeap vs cash. Closer. |
| Jobs | D+ | Stage + holds. Crew. Install window. Margin if role can see cost. |
| Accounts | D+ | Type, last job, membership, lifetime, owner. |

### Pipeline files (this is the product)

| Page | Now | A looks like |
|---|---|---|
| Lead `/leads/$id` | C- | Header: name, address, stage, next touch, related files. People: setter, closer, office, followers add/remove, transfer + reason. House: phones, spouse, email, ZIP, year, sqft, stories, utility, HOA, source, canvasser. Book / reschedule / cancel + reason. Disposition. Log call (direction, result, duration). Text. Internal. Task. Ticket. History of every write. Create from name+phone still works. |
| Assessment `/assessments/$id` | C | Packets on a phone. Fields + photo (caption + tile until upload). Progress. Complete writes SKUs onto option A of a new opportunity. Incomplete stays a Ran lead. |
| Opportunity `/opportunities/$id` | C | Pricebook. Three named options. Assessment photos pinned. Rules fire adders. Cash / 12-mo / GoodLeap with dealer fee from settings. Customer preview (Cozy mark, house, three totals, monthly). Send. Send to sign. Take card writes payment (amount, last four demo). Accept option births the job. |
| Job `/projects/$id` | C | Stage bar writes Today + Map. Holds write Today + Map. Crew + truck + window write Map. WO, PO, CO, invoice add from the file and hit costing. Revenue = sold + approved COs. Cost = labor + commission + received POs + extras. NTP visible. Close mints or merges account. |
| Account `/accounts/$id` | D+ | Toggle job lanes. Warranty dates. Callback / warranty / service with fee vs cost. Membership plan, cadence, next bill. New lead carries address + people. Close of that job merges. Same comms chrome. |

### Money

| Page | Now | A looks like |
|---|---|---|
| Sales `/scoreboard` | B | Year $ , close rate, set / run / sold. Office and closer filters. Tiles drill to names. Not the Today board. Pair: this week vs last week. |
| Invoices `/invoices` | D | Full-width list: number, job, name, kind, amount, paid, status, age. Send, record payment, void. Aging buckets. Row opens job. Payment writes cash on Today. |
| Purchasing `/purchasing` | D | Full-width POs: vendor, job, amount, status, received. Receive / partial. Watch $ matches job costing. Row opens job. |

### Company

| Page | Now | A looks like |
|---|---|---|
| Leaderboard `/leaderboard` | C | Closers and setters. Range: today / week / month / quarter / year / all-time. Rank, sold, $, close rate, sets. Tap a name -> person page. Points from settings. |
| Crews `/crews` | D+ | Trucks from settings roster. Who, next job, stock note, on-time vs late. Tap -> job or Map. Assign still happens on the job. |
| Team `/team` | F | Directory of people. Each name opens a person page: today / week / month / quarter / year / all-time sits, ran, sold, $, close rate, sets, tickets, last touch. Live: on a sit / quiet since noon. |
| Person (new) `/team/$name` | Missing | The page Team and Leaderboard drill into. Same numbers. List of that person's files. |
| Tickets `/tickets` | C | Full width. Open / waiting / done. Priority. Owner. Age. Related file. Create from here and from a file. Close writes history on the file. Oldest open in the count. |
| Reports `/reports` | F | Library of reports that run. Pin. Save. New. |
| Report `/reports/$id` | F | Real result. Count cards. Bar or table. Drill count -> names -> file. CSV. Date / office / person filters. No stub sentence. |
| Report builder `/reports/new` | F | Pick source (leads, calls, jobs, mix, combo, geo). Filters. Preview. Save. |

Reports that must exist for Reports to be an A: Today board share, leads by ZIP, leads by source/setter, calls excluding Internal, set/run/close, SKU A and SKU B, $ mix, job margin, service fee vs cost.

### Settings

Hub `/settings` now C. A: grouped directory, search, each row is a working page, last-changed note is optional and dull.

A for a settings page: add / rename / archive (no silent delete of in-use), the file or report that uses it updates the same minute.

| Group | Pages | A means |
|---|---|---|
| Shop | company, general, dealers, dealership, offices, pins, territories, sources | Company name on proposal. Offices on lists. Pins on canvass (when that ships). Territories on geo report. Sources on lead + lead report. |
| People | people, roles, positions, permissions, crew-roster, leaderboard-points, departments, my-team, calendar-filters, goals, installers | People appear as closers/setters/PMs. Permissions hide cost. Roster is Crews. Points hit Leaderboard. Goals hit Sales. My-team scopes lists. |
| Money | pricebook, financers, terms, commission, visits, rate-plans, discounts, extra-costs, catalog-extras | Pricebook + rules on the opportunity. GoodLeap fee on the tile. Commission on the job. Plans on the account. Discounts on the option. Extra costs on costing. |
| Pipeline | dispositions, ticket-types, templates, workflows, buckets, task-categories, sections, reduction-installs | Disposition chips. Ticket cats. Doc names on send. Buckets as saved list views. Assessment form packets from workflows. |
| Comms | notifications, reminders, numbers, notification-stages, notification-templates | From-number on the thread. Template body on send. Stages pick who gets booked/sold. Reminders listed, even if Twilio is later. |

---

## Waves (build order)

Shared work first, or every page stays a C.

### Wave 0. Floor (nothing else is an A without this)
- Kill `max-w-7xl` on lists, tickets, invoices, purchasing, team, crews, leaderboard, reports.
- One list chrome: columns, sticky name, saved views, search, filters that match data, empty state.
- One file chrome: title, people (edit followers, transfer), thread (Customer / Internal), history that records every write, Call logger, Book, Task, Ticket.
- Lead statuses in seed, filters, and Today use the same strings.
- No "ships in the next batch" anywhere.

Done when Elena's list row is full width and her file logs a call.

### Wave 1. Today, Book, Map, Inbox to A
- Today row actions write (called, confirmed). Cash from invoices/POs. Crew from jobs.
- Book uses appointments + install windows. Click block to file. Filter runs vs installs.
- Map pins from the same data. Assign on job moves pin.
- Inbox split pane, Internal tab, from-number, open file.

Done when unmarked on Today, the same sit on Book, the same pin on Map, the same thread in Inbox.

### Wave 2. All pipeline lists to A
Leads, Appointments, Assessments, Opportunities, Jobs, Accounts using Wave 0 chrome.
New lead stays name+phone.

Done when each list is full width, filters tell the truth, row opens the file.

### Wave 3. Lead file to A
House fields, spouse, transfer, followers, book/reschedule/reason, disposition, call log, next touch, related files.

Done when you can run Elena without leaving the file, then create a new lead and do the same.

### Wave 4. Assessment + Opportunity to A
Packets + photos. Complete -> option A SKUs. Three options, preview, send, sign status, take card payment row, accept -> job.

Done when Hale packets produce a proposal a homeowner could see, and accept creates Cho-shaped job scope.

### Wave 5. Job + Account + Invoices + Purchasing to A
Stage/holds/crew write Today and Map. Costing rule. Close -> account. Lanes, membership, visits, merge. Invoice send/pay. PO receive.

Done when closing Cho puts a lane on the account, a payment shows on Invoices and on Today's cash.

### Wave 6. Team, Leaderboard, Crews, Tickets, Person to A
Person page. Ranges. Leaderboard drills. Crews from roster. Tickets write the file.

Done when Marco this week vs last year is a tap, not a spreadsheet.

### Wave 7. Reports to A
Every report in the must-list runs, drills, CSV, save, pin. Builder saves a custom of the same.

Done when "deals with attic and HVAC" and "leads in 85388 this week" both open a name list that opens a file.

### Wave 8. Settings obedience to A
Each settings page either writes something Wave 1-7 already uses, or it is archived from the hub.
Permissions hide cost. Fee changes monthly. Commission changes job cost. Dispositions are the chips. Templates are the send body.

Done when you can change GoodLeap fee, a source, a closer's active flag, and see it on the opportunity, the lead report, and the book without a reload cheat.

---

## Scoreboard (update at the end of each wave)

| Page | Now | Target wave | A? |
|---|---|---|---|
| Today | B | 1 | |
| Inbox | C- | 1 | |
| Book | C | 1 | |
| Map | C | 1 | |
| Leads list | D+ | 2 | |
| Appointments | D+ | 2 | |
| Assessments list | D+ | 2 | |
| Opportunities list | D+ | 2 | |
| Jobs list | D+ | 2 | |
| Accounts list | D+ | 2 | |
| Lead file | C- | 3 | |
| Assessment file | C | 4 | |
| Opportunity file | C | 4 | |
| Job file | C | 5 | |
| Account file | D+ | 5 | |
| Sales | B | 6 | |
| Invoices | D | 5 | |
| Purchasing | D | 5 | |
| Leaderboard | C | 6 | |
| Crews | D+ | 6 | |
| Team | F | 6 | |
| Person | missing | 6 | |
| Tickets | C | 6 | |
| Reports library | F | 7 | |
| Report viewer | F | 7 | |
| Report builder | F | 7 | |
| Settings hub | C | 8 | |
| Settings pages (40) | C- | 8 | |

Nothing is an A today. Wave 0 is the floor. Wave 8 is the last A.

## Gate for a wave

I will not call a wave done unless:
1. The pages in that wave pass Done-when above.
2. Desktop 1280 and phone 390 both work.
3. A named file (Elena, Hale, Cho, Whitaker) was used, not a blank demo.
4. No stub sentence on those pages.

If you say "keep going," the order is Wave 0, then 1, then 2, and so on. If you name a wave, that wave only, still using this spec.
