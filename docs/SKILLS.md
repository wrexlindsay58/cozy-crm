# Skills

How a Cozy shop actually moves work, who is allowed to do it, and the three integrations (AI, realtime, payments). Recipes name the functions that exist. Do not add a parallel helper.

## Pipeline

The board is five stages. Do not skip one, and do not put a price on a raw lead.

1. **Lead** — contact, property, talk, book, transfer, drop, merge. No sold price.
2. **Assessment** — site details and category packets (photos, notes, measurements). `advanceToAssessment` in `src/features/flow/advance.ts`.
3. **Opportunity** — a proposal exists. Options, adders, discounts, payment terms. This is the quote. `advanceToOpportunity`.
4. **Job** — sold work: schedule, crews, materials, invoices, change orders, checklists. `advanceToJob` after the proposal is accepted.
5. **Account** — closed job, warranty, membership, callback. The next sale is a **new lead** that later merges history. `openAccountForJob`.

Record chrome is the same on every stage: Customer thread, Internal, Notes, History, Media & Files, Actions, tags, workflows, DND, book, call / text / email. Lead is the reference. Later stages show earlier work collapsed.

## Quote → invoice → payment

The quote is the opportunity proposal, not a separate object.

| Step     | What happens                                                           | Function                                                                           |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Quote    | Build options on the opportunity. Accepting one is the sale.           | `ensureOpportunity`, proposal `accepted`                                           |
| Sold job | Accepted option opens the job and carries the price.                   | `advanceToJob` → `openSoldJob`                                                     |
| Invoice  | Add a job invoice (deposit, progress, final) for an amount.            | `addInvoice(jobId, kind, amount)` in `src/features/job/store/money-03.ts`          |
| Payment  | Record money against that invoice. Status becomes `Partial` or `Paid`. | `recordPayment(jobId, invoiceId, amount, how, at)` or `payInvoice` for the balance |

`how` is one of: Cash/check, Cash/check + financing, CC, CC + financing, ACH, ACH + financing. Membership dues are a different ledger (`postCardPayment` in `src/features/membership/store/billing.ts`) and are not job invoices. A repair on a membership is charged on the visit, not as plan dues.

Taking a payment writes a history row. Undo must restore the invoice snapshot and call `dropLatestHistory` plus `dropLatestEmployeeAct` for that same `what` string. Do not delete the whole log.

## Access

Staff roles and permission keys live in `src/features/staff/store.parts/part-01.ts` (`PermKey`: `seeCost`, `takeCard`, `editCatalog`, `overrideFee`). The product words Admin / Dispatcher / Technician / Customer map onto those roles as follows. Customer is not a staff login.

|                         | seeCost | takeCard | editCatalog | overrideFee |
| ----------------------- | ------- | -------- | ----------- | ----------- |
| **Admin** → Owner       | yes     | yes      | yes         | yes         |
| **Dispatcher** → PM     | yes     | no       | no          | no          |
| Setter (books the lead) | no      | no       | no          | no          |
| Closer (runs the quote) | yes     | yes      | no          | no          |
| **Technician** → Crew   | no      | no       | no          | no          |
| **Customer**            | no      | no       | no          | no          |

- **Admin (Owner).** Settings, catalog, fee overrides, cost, cards. `canOverrideFee()` is this role. Fee approver falls back to the active Owner.
- **Dispatcher (PM).** Sees cost so the board and the job budget are honest. Does not take a card and does not edit the price book. Scheduling and crew assignment are this seat. Setters book appointments but do not see cost.
- **Technician (Crew).** Their stops, their checklist, their photos. No cost, no card, no catalog, no fee override.
- **Customer.** The Customer thread and the proposal / report link only. No Internal, no cost, no shop nav. A customer never gets a staff `viewAs` role.

Check a permission with `canSeeCost()` / `canOverrideFee()` (and the `perms` row for the other keys). Do not scatter `role === "Owner"` through a feature.

## AI stream

`src/features/ai/use-ai-stream.ts` reads an SSE response. Frames are `step`, `token`, `done`, or `error`, parsed only by `parseAIPayload` (`src/features/ai/schema.ts`). A frame that fails Zod is ignored.

```ts
const event = parseAIPayload(raw);
if (!event) return;
```

Tokens append to the current text. `done` replaces text only when the frame includes it. Pass the call's `AbortController` and abort it when the panel unmounts or the user hits stop. Do not render a mock paragraph in place of the stream. Keep the call user-initiated.

The on-screen surface is `src/components/ai-stream-view.tsx`.

## Realtime

`useRealtimeSync` (`src/features/realtime/use-realtime-sync.ts`) opens `VITE_REALTIME_URL`. SSE is preferred; a `ws:` / `wss:` URL uses the socket. Both paths end in `parseRealtimeEvent`.

Channels: `lead`, `job`, `membership`. Event types: `record.updated`, `record.deleted`, `presence`.

While a form is open, `setLocalEditing(id, true, snapshot)` and the sync layer holds the remote event instead of writing it. On close, if the pending event is an upsert, `reconcileRecord(base, current, patch)` copies remote fields the user did not change. A pending delete applies only when the local record is still the snapshot. Apply functions:

- `applyRemoteLeadPatch` / `applyRemoteLeadDelete` — `@/features/ops/store`
- `applyRemoteJobPatch` / `applyRemoteJobDelete` — `@/features/job/store`
- `applyRemoteMembershipPatch` / `applyRemoteMembershipDelete` — `@/features/membership/store`

Never write a remote patch straight onto a field the user is typing.

## Search and keys

- **Search.** `Cmd/Ctrl+K` focuses the omnibox (`src/features/search/omnibox.tsx`). On a narrow shell it opens the mobile search field. Results come from `searchFiles` over leads and actions. Picking a hit navigates and closes.
- **Lists.** `j` / `ArrowDown` and `k` / `ArrowUp` move the active row. Enter opens it. Ignored when focus is in an input, textarea, or contenteditable (`useRowKeys`).
- **Undo.** Any destructive shop action uses `undoToast(message, undo)` and stays on screen for 5 seconds.

## Payments, short version

Job balance: `payInvoice(jobId, invoiceId, how)` records the remainder and stamps the invoice `Paid` or leaves `Partial` if you used `recordPayment` with a smaller amount. Membership card: `postCardPayment`. The terminal UI is `@/features/pay/terminal`. Do not invent a second charge function.
