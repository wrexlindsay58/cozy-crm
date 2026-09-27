# Architecture

Cozy is a TanStack Start app (React 19, Vite, Tailwind v4, Kysely). The shop pipeline is Lead → Assessment → Opportunity → Job → Account. Same record chrome on every stage. This document is the rule for changing that tree without breaking the public paths.

## 8-step transformation standard

Every structural change follows these eight steps, in order. A step that cannot be finished stops the change. Do not mix a behavior change into a split.

1. **Inventory.** Line-count `src/**/*.{ts,tsx,css}` excluding `*.gen.ts`. Record every file over 150 lines and every importer of the public path (`@/features/...`, route files, `@/components/...`).
2. **Characterize.** Write down the exports, the mutable bindings, and the tests that already pin the behavior (`node --test` suites and `e2e/`). Do not rename a public function in this step.
3. **Strangle.** Add a co-located folder beside the legacy module (`thing.parts/` or `feature/store/`). The original path becomes a barrel that re-exports the parts, so importers do not move. Route files stay on their URL path and only re-export.
4. **Extract.** Move one cohesive unit at a time until every file is ≤ 150 lines. Nested function declarations that a sibling part needs must be returned from the prep function and destructured at the call site. Do not rewrite property names. Shared mutable `export let` bindings are assigned only through a `write_*` function in the module that declares them.
5. **Rewire state.** Server reads go through a TanStack Query key factory plus a Zod parser. Module stores keep their snapshot + `emit()` shape until this step replaces one of them. A new Zustand store must expose `undo` and `redo`. Destructive UI calls `undoToast` (5s) and restores the snapshot, including `dropLatestHistory` / `dropLatestEmployeeAct` when the action wrote a log row.
6. **Validate the boundary.** SSE, WebSocket, form, and server payloads enter through Zod (`parseAIPayload`, `parseRealtimeEvent`, or a feature schema). Failed parses are dropped, not coerced. Local edits set `setLocalEditing` so a remote patch cannot clobber an open form; `reconcileRecord` merges on blur.
7. **Prove.** `npx tsc --noEmit` is zero errors. Add or extend a Playwright spec under `e2e/` for the workflow you touched (see below). Unit tests that imported the old path still import that path.
8. **Cut over.** Delete the legacy body only after the barrel is the only public surface and step 7 is green. The pre-commit gate (typecheck, 150-line check, lint-staged) and the Vercel build must both pass on the result.

## Strangler fig

The legacy file stays importable for the whole migration.

```text
src/features/ops/store.ts          ← public barrel (stable)
src/features/ops/store.parts/      ← parts, each ≤ 150 lines
```

Callers keep `@/features/ops/store`. A part never imports another feature's parts. When the last caller of a deprecated export is gone, delete the export in the same change as the caller. Do not leave a second implementation behind the barrel.

`export let` across files is a live ESM binding. The assigning file imports `write_name` from the declaring file. Do not reassign an imported binding.

## State and optimistic UI

| Kind         | Where                                             | Rule                                                                                                        |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Server rows  | TanStack Query                                    | `queryOptions` + key factory only. Zod on the way in. Invalidate the factory prefix, not a hand-typed key.  |
| Shop session | feature store (`useSyncExternalStore` or Zustand) | Update first, paint first. Keep the previous value.                                                         |
| Undo         | `src/lib/undo-toast.ts`                           | 5 second Sonner Undo. The callback writes the snapshot back and drops the one history row the action added. |
| Realtime     | `src/features/realtime/`                          | Hold while `isLocallyEditing`. Reconcile field-by-field. Presence is not a record write.                    |

Optimistic shape for a destructive action:

1. Read the snapshot.
2. Write the next state and the history row.
3. `undoToast(label, () => { restore snapshot; drop the matching log row })`.
4. If a later server call fails, run that same undo.

Zustand stores, when introduced, keep a past/future stack and surface `undo()` / `redo()` in addition to the toast. The toast stays the user-facing control.

## Playwright

`playwright.config.ts` runs `e2e/` against `E2E_BASE_URL` or `http://127.0.0.1:8080`. Specs assert shop behavior, not pixels: a lead can advance, a proposal can be accepted, an invoice can take a payment, Undo restores the row.

A change to a workflow in `docs/SKILLS.md` adds or updates one spec for that workflow in the same change. Do not point a new spec at a private `*.parts` file. Drive the screen the owner uses.

`npm test` stays the node:test suite (`src/lib/**/*.test.ts` and `scripts/**/*.test.mjs`). Playwright is the end-to-end layer, not a replacement for those.

## CI and the Vercel build

Local gate, on every commit (`.husky/pre-commit`):

1. `npx tsc --noEmit`
2. `node scripts/check-file-size.js` — staged `ts/tsx/js/jsx/mjs/css` over 150 lines fail; `*.gen.ts` is ignored
3. `npx lint-staged`

Deploy (`vercel.json`):

- Install: `npm ci`
- Build: `node scripts/with-app-env.mjs vite build`
- App `build` script also runs `npm run db:migrate` (`scripts/migrate.mjs`) so Neon/PGLite schema from `migrations/*.sql` is applied before traffic.
- Schema changes belong in a new SQL migration, never inline in a server function.
- No `.env` in the repo. `DATABASE_URL` and auth secrets are injected by the host. Only `VITE_` variables ship to the browser.
- Do not write the runtime filesystem, and do not call Node-only APIs at module import time. Both pass locally and fail on Vercel.

`src/routeTree.gen.ts` is generated by the router plugin. Never hand-edit it. It is exempt from the line cap.
