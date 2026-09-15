# Forensic audit: Cozy CRM vs Odin vs the field

Date: 14 Sep 2026
Repos: wrexlindsay58/Odin-crm (CakePHP, live shop) and wrexlindsay58/cozy-crm (this frontend, commit cf791f7)
Audience: owner of a $500k to $3M home-performance shop who will grow past $10M on this same product
This document is the spec. Later work is graded against it.

---

## 1. Verdict

Cozy-crm today is a skin of a CRM. It has the right nouns (lead, assessment, opportunity, job, account) and the right rail (Daily, Pipeline, Money, Company). The files do not hold a job. The lists are demo tables in a 80rem box. Reports are stubs. Call does not log a call. Take card does not take a card. Photos are gray rectangles.

Odin-crm is the opposite problem. It already tracks the shop. LeadsController is 537 KB. Documents 321 KB. Reports 404 KB. Rest/Calendars 483 KB. PearlHomes 484 KB. NotificationComponent 231 KB. CommonComponent 965 KB. That is a working contractor operating system with a 2014 face and a 90-day learning curve of its own.

ServiceTitan wins depth and loses the $500k-$3M owner on price, contract, and time-to-first-book. Jobber and Housecall Pro win speed and lose the in-home sales motion (setter, closer, sit, one-legger, GoodLeap, assessment packets). MarketSharp and Leap win canvasser-to-close and lose production. Sera wins margin-on-the-quote and memberships, and is still a service-dispatch tool, not a home-performance CRM.

The hole Cozy has to occupy: Odin's data model and sales motion, Housecall Pro's proposal the homeowner is not embarrassed to sit through, Jobber's "I knew it in a day," ServiceTitan's costing and memberships, Sera's sold-vs-actual, Workiz's inbound call on the lead. None of that is true today in cozy-crm.

If we ship lists that look full-width and files that still cannot transfer a lead, we failed this document.

---

## 2. Who this is for (how they think)

Not a GC. Not a 40-truck Titan shop. Not a solo plumber.

The owner:

- Did the work with his hands. Still jumps a sit when a closer no-shows.
- Has 4 to 18 people. Setter, closer, PM, 1-3 crews. Maybe a CSR.
- Checks the book on a phone at a red light. If a screen needs a legend, it is dead.
- Is ashamed when the proposal looks like a Word doc. The homeowner is comparing them to a $20M shop that sat last night.
- Does not have an ops analyst. Will not hire a Salesforce admin. Will not sit a 12-week implementation.
- Trusts names, not tiles. "Elena is unmarked" moves him. "Pipeline health 72" does not.
- Loses money in unmarked sits, one-leggers, HOA holds, and jobs that close in the CRM and leak in the field.
- Wants to know, without asking, whether Marco is producing this week, whether Crew 2 is sitting, and whether GoodLeap is actually funded.
- Will grow. The same file that works at $800k has to hold 8 closers, 4 offices, and memberships at $12M.

Fear: looking small. Looking lost in front of a homeowner. Looking lost in front of a closer who used to work at a Titan shop.

Time: they will give a new screen about 8 seconds. If the next tap is not obvious, they call the office.

Skill: mixed. Some live in the phone. Some still write the book on paper and have a kid type it in. The UI has to survive both.

What "look established" means in the product:

- The proposal the customer sees: photo, three options, monthly, GoodLeap, Cozy mark, no Comic Sans energy.
- The text they get: from a named office number, on-brand, timed.
- The owner screen: names, money, late. Not a SaaS onboarding tour.

---

## 3. Competitor map (steal / skip)

### ServiceTitan
Steal: flat-rate pricebook, job costing (sold vs cost vs margin), memberships/service agreements, call recording + source, tech GPS, memberships on the account, reporting that drills to a name, financing in the quote.
Skip: $245/tech/month, 2-3 year contract, 12-16 week setup, 60-90 day learning curve, 180 integrations as a selling point. Our owner cannot pay $60k/year to find out if the software fits.

### Housecall Pro
Steal: Good / Better / Best on a tablet in the house. Photos on the option. Financing on the same card. Membership sold on the same sit. The customer-facing look.
Skip: no real in-home sales CRM (no setter/closer/sit/disposition). Weak custom reports. Manual dispatch. Not built for attic + HVAC packages with adders that fire from rules.

### Jobber
Steal: day-one. Drag book. Mobile that a new installer will use. Route. Invoice + pay on site. No poetry on the screen.
Skip: no inventory, no built-in financing, weak pricebook, weak reporting, no canvasser/setter motion. Caps around 15 techs in practice.

### Sera
Steal: quote priced from cost + target margin, not a guess. Membership pricing on the same quote (member vs not). Sold hours vs actual hours. Recurring membership as a first-class object.
Skip: still a service FSM. Not a canvass-to-sit CRM. Not home-performance packets.

### FieldPulse
Steal: mobile-first file, custom fields without a consultant, unlimited-users feel, job photos that are not an afterthought.
Skip: shallower accounting, shallower sales CRM.

### Workiz
Steal: inbound call is a lead. Caller ID. Missed-call text. Dispatch from the call. The phone is the CRM.
Skip: locksmith-shaped. Not a $25k in-home close.

### MarketSharp / improveit 360 / Leap (home-improvement sales)
Steal: source on every lead, canvasser credit, set / demo / sold / not-sold-reason, cost-per-lead, appointment machine, in-home close with financing, follow-up campaigns.
Skip: Salesforce under improveit. Weak production. Weak home-performance assessment.

### AccuLynx / JobNimbus (roof / exterior)
Steal: production board, POs to vendors, file that survives from knock to paid.
Skip: insurance supplements, EagleView, roof-only catalogs. User already said products and pricing owns equipment. No roof/HVAC admin screens. No Salesforce.

### What none of them do well for THIS shop
- Setter and closer as first-class roles on the same sit.
- Assessment packets (HVAC, attic, air seal, ducts, windows) with photos that become the proposal.
- GoodLeap as the default financer, dealer fee on the option, NTP on the job.
- Canvass pins (home / not home / NI) that become leads.
- Internal notes vs customer thread on the same file, labeled Internal.
- Home-performance math: R-value, existing depth, rebate, dump run, permit.
- Owner Today board: late names first, tonight's sits, cash. Not a year dashboard.

That last list is Cozy's job.

---

## 4. Odin-crm forensic (what the live shop already is)

Odin is CakePHP. It is not pretty. It is complete in the ways that keep a home-performance office alive.

### Size (proof we under-read it)
- LeadsController.php: 537,215 bytes
- Rest/LeadsController.php: 375,996
- PearlHomesController.php: 484,211
- Rest/CalendarsController.php: 482,880
- ReportsController.php: 403,820
- DocumentsController.php: 321,396
- EmployeesController.php: 309,298
- Rest/DocumentsController.php: 263,990
- OpportunitiesController.php: 239,691
- NotificationComponent.php: 230,885
- Rest/InstallationController.php: 188,718
- Rest/ExchangesController.php: 157,015
- DealsController.php: 126,002
- Rest/DealsController.php: 105,320
- CustomersController.php: 87,458
- AppointmentsController.php: 69,932
- FrontendLeadWorkFlowSectionFieldsController.php: 69,559
- PerformanceController.php: 71,506
- CommonComponent.php: 964,723

If a controller is 500 KB, the lead file in Odin is not "name, phone, status."

### Objects Odin already has (must exist in Cozy, even as demo writes)
**People and access**
Employees, positions, position-roles, qualifications, reporting lines, departments, offices, dealers, my-team, leaderboard points, permissions.

**Lead machine**
Leads, appointments, buckets, lead workflows, workflow section fields, door-knocking pin statuses, sources, dispositions, transfer, followers, notes, tasks, tickets.

**Sit to money**
Opportunities, deals, documents (proposal, agreement, change order), financers, discounts, rebates, additional costs, additions/reductions (the option/adder engine), product types, manufactures, rate plans, rate-plan features.

**House**
Pearl homes (property + diagnostics), installation forms, installations, installers, installer panels. (User: no separate solar inverter/panel admin. Catalog holds SKUs.)

**Production**
Installations REST, exchanges (materials), documents, work in calendar.

**After the job**
Customers (accounts), memberships via rate plans, notifications, notification stages, templates, from-numbers, reminders.

**Brain**
Reports (404 KB: this is not a chart widget), performance, general settings, notification settings.

### Odin motion we already agreed (keep this)
1. Lead = contact + property pointer + comms + book + transfer + followers + tasks + tickets. Not a cost. Not a price.
2. Assessment = house packets (what we saw, photos, measurements). Optional now, required for the product to beat Housecall Pro.
3. Opportunity = a proposal exists. Options, financing, take card, GoodLeap, send, sign.
4. Job = sold work. Dispatch, crew, WO, PO, CO, costing, holds, NTP, close-out.
5. Account = closed jobs live here. Warranty, callback, membership, service fee vs cost. New lead off the account re-enters the pipeline and merges back so two job histories sit on one house.

Every pipeline file: Call, Text, Internal, Book, Task, Ticket, History. Same chrome. Different body.

### Odin we will not copy
- Salesforce screens.
- Roof-only and HVAC-only admin (catalog instead).
- Solar inverter / panel libraries as their own settings.
- The CakePHP page weight. Five-second loads. Mystery menus.
- Settings nobody uses (hobbies, donations, leagues) unless the user names them.

### Odin we will copy in spirit
The lead file is the product. If the lead file is thin, the company is thin. Reports that answer "how many deals had attic AND HVAC in Surprise this month." Notifications that fire when booked, ran, sold, install. Documents that are real files, not a status string. Calendar that is the book, not a month grid of dots.

---

## 5. cozy-crm forensic (what GitHub actually has)

Tip: cf791f7 on main. Demo data in memory. Auth off. No Odin API. No Twilio. No GoodLeap. No GPS.

### What is real (keep)
- Four-group rail: Daily / Pipeline / Money / Company.
- Today is late names, tonight, cash. Sales is the year. Those are no longer the same page.
- RecordShell chrome on lead, assessment, opportunity, job, account: title, stage, money, owner, followers, Call/Text, Internal vs customer thread, tickets, photos rail, history.
- New lead sheet (name + phone enough).
- Book widget writes an appointment into the ops store.
- Disposition chips. Ran can mint an assessment.
- Assessment packets (HVAC, attic, air seal, ducts, windows) with field counts.
- Opportunity pricebook chips, three option cards, adder-from-rule, GoodLeap/cash/12-mo tiles, send proposal, take card (status only).
- Job stage bar, holds, crew/truck, costing strip (revenue = sold + approved COs), POs, invoices, COs.
- Account: job lanes, membership card, new lead, visits, photos.
- Settings hub with 40+ routes. Many are word lists. Pricebook editor and financers actually write.
- Dispatch map with late pins (demo).
- Inbox with customer / Internal.

### Grades (honest)

| Surface | Grade | Why |
|---|---|---|
| Today | B | Does the 6:40a job. Not the file. |
| Sales | B | Year money. Not productivity by person over a career. |
| Lists (all) | D+ | `max-w-7xl` (~80rem). Centered. Not full width. No saved view. No bulk. No column pick. No last-touch. Filters on leads do not match seed statuses (`Set — no run` vs `Set, no run`). |
| Lead file | C- | Chrome yes. No transfer. No add follower. No second phone. No spouse. No property (year, sqft, stories, utility). Call button does not log. History empty until you type. No source campaign. No canvass pin. No reschedule with reason. |
| Assessment | C | Packets exist. Photos are empty gray. No voice notes. Complete mints an opp id in the store, does not build a real proposal from the packets. One seeded house. |
| Opportunity | C | Options math works in demo. No PDF. No e-sign. No GoodLeap API. No photos from the assessment on the option. No deposit invoice. Take card is a status flip. |
| Job | C | Stage/crew/costing demo. No WO print. No GPS. No time on site. No inventory decrement. Close does not mint an account. |
| Account | D+ | Cho has almost no visits. Whitaker has two. Membership is a card. No billing run. No warranty calendar. Merge of a new lead back onto the account is a button, not a merge. |
| Invoices / Purchasing | D | Short lists. Open the job. No send, no record payment, no aging, no vendor portal. |
| Reports | F | `builder.tsx` is one sentence: "Custom builder ships in the next batch." `board.tsx` same. `viewer.tsx` prints the id. Library is links to empty. This is the thing you asked for twice and did not get. |
| Settings | C- | Hub is a directory. Many pages are a word list and an add field. Pricebook and GoodLeap fee write. Permissions do not hide cost on the job. |
| Comms | C- | Demo thread. Internal label is correct. No from-number. No templates fired. No call log. No recording. |
| Dispatch / Book | C | Map and calendar skins. Book widget on the lead writes. Not the live book closers live in. |
| Team productivity | F | Leaderboard is YTD sold. No clock-in. No sits today. No talk time. No install hours vs sold hours. No "Marco this week vs last year." |

### Concrete bugs (not taste)
- Lists capped at `max-w-7xl`. User asked for full width. That is a layout bug, not a phase.
- Lead filters use `Set — no run`. Seed data is `Set, no run`. Filter lies.
- Call, Text (except the composer), Take card, Send proposal are optimistic labels. They write a history line or a status. They do not call, text a carrier, or move money.
- Photos are CSS rectangles.
- Reports promised combo-item, zip, call (excluding Internal), drill to names. Not in the repo.
- Expert-mode GitHub dump restored the shells. It did not restore the report stack that was described in chat. That work never landed as files.

### What the owner feels on current files
He opens Elena. He sees a form, a disposition, a thread. He cannot transfer her to Dallas. He cannot add the spouse. He cannot log that he called and left a voicemail. He cannot see last night's canvass pin. He cannot put the attic photo on option A. He cannot show her a proposal that looks like Cozy. He cannot tell if Priya's sets this week are better than last week.

That is why it is not elite. The chrome is a promise the body does not keep.

---

## 6. Customer path (what "best ever" has to hold)

One house. One file that changes costume.

```
Canvass / web / call / referral
        -> Lead (contact, book, chase)
        -> Sit happens (disposition)
        -> Assessment (what we saw)
        -> Opportunity (proposal exists)
        -> Job (we sold it, we build it)
        -> Account (we still own the house)
        -> New lead off account (they buy again)
        -> merges back (two job lanes, one house)
```

At every costume the same six things work: Call, Text, Internal, Book, Task, Ticket. History is append-only and never poetic. Names, times, what changed.

### Lead (must)
Contact: name, phones, email, spouse, preferred contact, do-not-text.
House: address, unit, city, ZIP, year, sqft, stories, utility, HOA.
Source: channel, campaign, canvasser, pin result.
People: setter, closer, office, followers, transfer with reason.
Book: set, confirm, reschedule with reason, no-sit, one-legger.
Chase: next touch, last touch, last outcome.
Log: call (outbound, inbound, duration, result), text, email, Internal, note.
Open: task, ticket.
Not: price, COGS, proposal. That is later.

### Assessment (must)
Packets from the catalog of what this shop inspects. HVAC, attic, air seal, ducts, windows as the Cozy default. Each packet: fields, photos, pass/fail, notes.
Complete writes the facts onto the opportunity. Incomplete stays a lead with a sit that ran.

### Opportunity (must)
Products from the pricebook. Rules fire adders (HVAC -> ducts default on).
Three options. Owner names them. Totals include dealer fee when GoodLeap is selected.
Pay: cash, 12-month, GoodLeap term. Monthly shown. Take card (demo charge + last four until a processor is live).
Send proposal (PDF skin + link). Send to sign. Status on the title row.
Accept option writes job scope.

### Job (must)
Stage: Sold, Materials, Scheduled, In progress, Punch, Invoiced, Closed.
Holds: HOA, permit, rebate, customer, weather, finance. Hold is visible on Today and Map.
Crew, truck, window. Assign writes the map.
WO, PO, CO, invoices. Costing: sold + approved COs = revenue. Labor + commission + received POs + extras = cost.
NTP / GoodLeap funded.
Close mints or merges account.

### Account (must)
Every closed job as a lane you can toggle.
Warranty dates. Callback / service visit with fee vs cost.
Membership: plan, cadence, amount, next bill, paused.
New lead from this house. On close, merge. Do not fork a second account.

### Team (must)
For any person, for today / week / month / quarter / year / all-time:
sits, ran, sold, $ sold, close rate, sets (if setter), tickets open, hours on jobs (when we have them), last activity.
Live: who is on a sit, who is in transit, who has not logged a touch since noon.

### Reports (must, this time for real)
Not a library of dead links.
- Saturday / Today board as a report you can share.
- Leads: source, ZIP, setter, status, age, office, date range. Drill: count -> names -> file.
- Calls/texts: outbound, inbound. Exclude Internal. By person, by file.
- Funnel: set, ran, sold, $ , close rate. By closer, office, week.
- Combo: deals that included SKU A and SKU B.
- Mix: $ by product.
- Geo: ZIP choropleth or bar, then names.
- Job margin: open P&L.
- Service: fee vs cost, membership count.
Export CSV. Share link (demo: copy view). Saved reports. Pin to hub.

---

## 7. UX rules (how it has to feel)

From design-ui + no-ai-slop + this shop:

- Full-width lists. No `max-w-7xl` on pipeline lists. The table uses the pane. Sticky first column (name). Sticky header.
- Dense on desktop (one row = one house). Big tap targets on the phone (the row is the tap, then the file).
- One primary action per view. On a lead: Book or Call, depending on next.
- File is not a dashboard of widgets. It is a header (who, stage, $) + the body for this costume + a persistent thread.
- Thread: Customer | Internal. Always. Composer focused when they hit Text.
- Empty states: "No sits tonight." + Book. Not a lecture.
- Color: navy, ink, stop, watch, go. No extra hues. No gradients. No badges that say SMART.
- Type: IBM Plex as now. Numbers tabular.
- Mobile lead create: name + phone, then the file. Already started. Keep it.
- Proposal the customer sees can look expensive. The office screens stay dull and fast.
- Do not explain the product on the product.

---

## 8. Plan (hold me to this)

Each phase is a build you can click. If a box is not ticked, the phase is not done. No "next batch" sentences in the UI.

Demo writes (in-memory store) are allowed until Odin is bound. Labels must not lie: a button named Call must write a call log. A button named Take card must write a payment row (demo authorized). When a live processor exists, the same button hits it.

### Phase L1. Lists that a manager can live in
Done when:
- Leads, appointments, assessments, opportunities, jobs, accounts, invoices, purchasing are full-width in the pane (no 80rem cage).
- Columns: name, status/stage, next/when, who, office, $, last touch. Extra columns behind a picker.
- Filters match real statuses. Saved view per list (All late, My book, Phoenix, Unmarked).
- Search is the same as the header search (name, phone, address, id).
- Row click opens the file. Hover does not invent a drawer that hides the table.
- Empty filter: "No leads in Unmarked." Clear filter.
- Mobile: list is full bleed, row height >= 44px, New lead stays a fat button.

### Phase L2. Lead file that can run the office
Done when, on Elena and on a lead you just created:
- Edit phones, spouse, email, address, ZIP, year, sqft, stories, utility, HOA, source, canvasser, setter, closer, office, notes.
- Transfer (picker of people + reason) writes history and changes owner.
- Followers: add/remove.
- Book, reschedule, cancel with reason.
- Disposition including no-sit, one-legger, ran (ran can start assessment).
- Log call: direction, result (answered, VM, no answer), duration, note.
- Text and Internal already exist; they stay.
- Task and ticket already exist; they stay and show on the file and on Tickets.
- History lists every write, newest first, with who and when.
- Next touch is visible in the header.
- Related: assessment, opportunity, jobs, account when they exist.

### Phase L3. Assessment that becomes the proposal
Done when:
- Packets are completeable on a phone (fields + add photo that at least stores a caption and a color tile until real upload).
- Progress on the packet list (3/5 HVAC).
- Complete writes packet facts onto a new opportunity's recommended option (attic depth -> attic SKU, dead condenser -> HVAC SKU).
- Incomplete assessment is still a lead with Ran.

### Phase L4. Opportunity that can close in the house
Done when:
- Three options, renameable. Rules still fire adders.
- Photos from assessment can be pinned to an option.
- Pay tiles: cash, 12-mo, GoodLeap. Dealer fee from settings changes the GoodLeap total and the monthly.
- Send proposal opens a customer-looking preview (Cozy mark, house address, three totals, monthly). Status: Sent.
- Send to sign. Status on the title.
- Take card writes a payment (amount, last four demo, who).
- Accept option creates/updates the job scope and is the only way a job is born from sales.
- Deposit invoice stub appears on the job.

### Phase L5. Job that production can run
Done when:
- Stage and holds write Today and Map.
- Assign crew + truck + window writes dispatch.
- WO, PO, CO, invoice can be added from the file. Amounts hit costing.
- Costing matches the rule already written: revenue = sold + approved COs. Cost = labor + commission + received POs + extras.
- NTP / finance status visible.
- Close job: pick or create account, move the lane.

### Phase L6. Account that keeps the house
Done when:
- Toggle job lanes (2025 envelope vs 2026 HVAC).
- Schedule callback / warranty / service. Fee vs cost.
- Membership: plan from settings, cadence, next bill.
- New lead from account carries address and people. On that job's close, merge.

### Phase L7. Team, live
Done when:
- Person page: today / week / month / quarter / year / all-time sits, ran, sold, $, close rate, sets, last touch.
- Today shows who is late, who is on a sit, who has not touched a file.
- Map still shows late. Crew assignment from the job is the pin.

### Phase L8. Reports that answer the questions you already asked
Done when these run on the demo data and drill count -> names -> file:
- Leads by ZIP in a date range
- Leads by source / setter
- Calls and texts, Internal excluded
- Set / run / close by closer and week
- Deals with SKU A and SKU B
- $ mix by product
- Job margin on open jobs
- Service fee vs cost
- Export CSV on every report
- Save, pin, open from Reports
No sentence in the UI that says a batch is coming.

### Phase L9. Settings that the files already obey
Done when changing these changes a file the same minute:
- Pricebook + rules (already close)
- GoodLeap dealer fee (already close)
- Commission % writes job commission (wire is half there)
- Dispositions, sources, offices, people, roles, permissions (see cost hides costing)
- Notification templates are visible on send (even if we do not hit Twilio yet)
- From-numbers show on the thread header

### Out of this plan (say so now)
- Live Twilio / carrier SMS
- Live GoodLeap API and real card processor
- Live GPS from phones
- Live Odin bind (PHP API)
- Customer self-serve portal login
- QuickBooks two-way
- AI dispatch
These get their own plan when you say go. The UI will be built so they plug in without a rewrite.

---

## 9. Order of build (so we do not skip again)

1. L1 lists (full width). You already called this out. It is the first click.
2. L2 lead file. If the lead file is elite, the rest has a place to hang.
3. L8 reports skeleton with two live reports (leads-by-ZIP, set/run/close) so reports stop being a lie while files deepen.
4. L3 assessment -> L4 opportunity (proposal is the money screen).
5. L5 job -> L6 account.
6. L7 team.
7. Finish L8 remaining reports.
8. L9 settings obedience pass.

If a later chat says "phase 15" and L1-L2 are not ticked, stop and tick them.

---

## 10. Definition of elite (use this as the gate)

A closer can, on a phone, in one file, without a tutorial:
1. See Elena is unmarked.
2. Call, log VM.
3. Text the confirm.
4. Internal: "both spouses or no run."
5. Sit happens. Disposition Ran.
6. Fill attic + HVAC packets with two photos.
7. Complete. Opportunity opens with those SKUs on option A.
8. Turn on GoodLeap. Monthly updates from dealer fee.
9. Send proposal. Homeowner sees Cozy, not a spreadsheet.
10. Take card / send to sign.
11. Job appears. Tasha assigns Crew 2. Map updates.
12. Close. Account has the job. Next year they buy windows. New lead. Merge. Two lanes.

If any step is a dead button or a gray box, we are not done.

A manager can, without exporting to Sheets:
- See Marco's sold this week vs last week vs last year.
- See which ZIP produced sits this week.
- See how many sold jobs had attic and HVAC together.
- See who has not logged a touch today.

If those four require a "next batch" line, we failed this document.
