# Wave 0 forensic audit

Date: 15 Sep 2026
Commit: 834c702 (floor) plus lead-file fixes in this pass.
Method: code, Playwright on 1400 and 390, Elena Vargas as the proof file.

This is the audit of the floor, not Wave 1. Today / Book / Map / Inbox were not in scope.

## Grade

| Surface | Wave 0 ship | After this pass | A bar |
|---|---|---|---|
| List chrome (all pipeline lists) | B- | B- | Full pane, sticky name, filters that match seed, search, 44px rows. Missing column picker, saved views beyond chips, My book / age > 3d. |
| Lead list | B- | B | Same, plus Dropped view. Fake $ column removed. |
| Shared file chrome | C+ | B | Call writes. Follow / transfer write. Thread was a FAB under 1280. Now always on. History was a second list under the form. Now in the thread. |
| Lead file | C- | B- | Email was in the model and hidden. Source was a text box. Product SKU on a lead. Fake $18,420 in the header. No spouse. No drop. No referee. |
| Global search | B | B | Header finds Elena by phone and opens the file. |
| Appointments / jobs / accounts lists | B- | B- | Floor only. |
| Settings obedience | D | D | Not Wave 0. |

Wave 0 Done-when: Elena’s list row spans the pane. Her file logs a call. **Pass.**

Wave 0 is not an A. The floor holds. The lead file was still a form with the wrong fields.

## What passed (browser)

- `/leads` table starts at the nav edge. No 80rem cage. Width fills the pane.
- Filter `Set, no run` matches seed. Elena stays. Sharon leaves.
- New lead and row height 44px at 390.
- Elena file: Call → Save call writes `Call Out · Answered.` into history and the thread.
- Follow writes. Transfer writes.
- Header search `(623) 555-0144` opens Elena.
- Opportunity filter is `Won, production`, not an em dash that matched nothing.
- Jobs title matches nav.

## What failed on the lead (your list, confirmed in code)

1. Follower `x` always visible. Should be hover only.
2. Email lived on the Lead type. The form skipped it. Phone then Address. Dead field.
3. Product SKU on a lead. Pricebook belongs later. Lead needs interest, not a line item.
4. Header showed `$18,420` as if we knew the job. We do not. Removed.
5. Thread hid behind a FAB under 1280. GHL keeps the conversation on the file. Thread is now a persistent pane (46vh on the phone, 380px on desktop). History events sit in that pane, not a second card under the form.
6. No Drop. Added. Reason required. Status Dropped. File stays.
7. No second homeowner. Added.
8. Lead source was a free text input. Now the Sources list from Settings.
9. Referral did not ask who sent them. Referrer name + phone when source is Referral. Marcus Bell already has The Whitakers.
10. Product field replaced with Main interests: Insulation Services, Duct Services, HVAC, All of the above, Other.

## Still not A (do not pretend)

- House facts (year, sqft, stories, utility, HOA, ZIP) are Wave 3.
- Speak-to-text on notes / Internal is Wave 3.
- Book / confirm / no-sit from the list row is Wave 1–2.
- Thread is local demo, not Twilio.
- Interests are categories, not SKUs. Correct for a lead.
- History in the thread is file events + messages. It is not a perfect GHL timestamp sort. Call lines are not duplicated.

## Proof to click

1. Leads. Elena is full width. No $ column.
2. Open Elena. No money in the top right. Email under phone.
3. Hover Priya. `x` appears. Leave. `x` gone.
4. Add homeowner. Source = Referral shows referrer fields.
5. Main interests chips. Other reveals a line.
6. Thread is on the right (desktop) or under the form (phone). Priya’s canvass note is in it. Type a text. Send.
7. Drop with a reason. Status Dropped. Still in All. Lives under Dropped.

## Next

Wave 1 is still Today, Book, Map, Inbox. Not this pass.
