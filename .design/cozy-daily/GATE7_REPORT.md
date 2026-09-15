# Gate 7 report

Mon Sep 14 2026. Shots in `.design/cozy-daily/shots/`. One Fail = not done.

## A. Audit 1 must-fixes

- [x] Pass. Bad and good do not wear the same clothes. `today-1280-fold.png` — Sharon/Chris sit on stop wash, Nina/Owen on watch wash, cash out on stop wash. Ran/sold use go on Book blocks.
- [x] Pass. Sales today owns Today. `today-1280-fold.png` — $0 is the first figure. Yesterday $28,640 and week $412,400 are the pair.
- [x] Pass. No equal-tile vanity row on Today or Sales. `today-1280-fold.png` has no 5-up KPI row. `sales-1280-fold.png` opens on YTD / Week / Cancel money, then a drill, not six icons.
- [x] Pass. Selected state is visible at arm's length. Inbox uses a 4px navy left bar (`inbox-1440-fold.png`). Book picked block fills ink (`book-1280.png` after click). Map list uses 4px left bar + page fill. Filter chips fill navy.
- [x] Pass. Cards chunk. Gray-on-gray drill tiles are gone. One page frame: title row, body, navy chrome.

## B. Alignment / space / color

- [x] Pass. Numbers that compete share a digit column. Closers week is `1fr / 3rem / 7rem`. Cash in/out sit on one strip. Sales YTD/Week/Cancel are one row of figures.
- [x] Pass. Gaps 4 / 8 / 12 / 16 / 24 / 32. Page pad 16. Section gap 16. Row py 8.
- [x] Pass. Header 56 (`h-14` / `min-h-14`). Book name header 56. Book hour row 56. Rail item 40 (`h-10`).
- [x] Pass. Status hues are stop / watch / go / info / idle only.
- [x] Pass. No chart blue, no mint chip, no logo red in chrome. Bars are navy. Logo red stays in the house mark only.

## C. Contractor fit

- [x] Pass. Above Today fold at 1280: money, named exceptions, tonight's runs, cash strip. `today-1280-fold.png`.
- [x] Pass. Names appear before extra counts. Late is Sharon, Chris, Nina, Owen, Greg, Marcus. Tonight is people and times.
- [x] Pass. Empty board can read clear. Book morning 7a-3p on Mon is empty grid, not fake plus. `book-1280-fold.png`.
- [x] Pass. No dead buttons. Call is `tel:`. Book opens the board. Inbox opens the thread. Map Call/Text work. Send writes a message. Note writes a note.
- [x] Pass. One clock. `clockLabel()` / `formatClock()`. Title stamp and Today "as of" share it. Last ping 4:42p is a field, not the page clock.
- [x] Pass. Shop words: run, sit, unmarked, closer, crew, shop, book, jobs.

## D. Completeness

- [x] Pass. Rail is 6: Today, Inbox, Book, Map, Leads, Jobs. Company accordion holds the rest.
- [x] Pass. Inbox titled Inbox. `inbox-1440-fold.png`.
- [x] Pass. Book columns = people, rows = hours. `book-1280.png`.
- [x] Pass. Map loads in 3s with pins. `map-1280-fold.png` — CARTO raster + 40px pins. Schematic underneath until tiles paint.
- [x] Pass. Screenshots 375 / 768 / 1280 / 1440 for Today, Book, Map, Inbox, Sales. 40 files: `{page}-{width}.png` and `{page}-{width}-fold.png`.
- [x] Pass. No horizontal clip of chrome. Playwright `scrollWidth <= clientWidth` on every shot.
- [x] Pass. `tsc --noEmit` clean.
- [x] Pass. Click path Today → Elena Vargas → lead file → Book → Map → Inbox. All 200.

## E. Critique scores

- [x] Pass. Today hierarchy 5.
- [x] Pass. Today space 4.
- [x] Pass. Today color 5.
- [x] Pass. No page scored 1 on hierarchy. Book 5, Inbox 4, Map 4, Sales 4.

## Gate 4–6 extras

- [x] Sit-mix widths match percents 11 / 56 / 22 / 11.
- [x] 2-hour sit is 2× a 1-hour sit (Elena 2h vs Cho referral 1h).
- [x] 8p is on the Book board. `book-1280.png`.
- [x] Inbox thread is the widest pane at 1440. `inbox-1440-fold.png`.
- [x] Unmarked tile is stop wash. `sales-1280-fold.png`.
- [x] Grep: no em dash in product UI strings. No Year scoreboard, Conversations (as a title), Members, Households.

## Verdict

Pass.
