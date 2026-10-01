# Reset one prototype actor’s Awaken progress

This command is confined to branch `prototype/awaken-lived-journey`, following
participant wording commit `f92d96adf64caea649ec113627f808feb2ab2b2a`.
It preserves the account and resets only these persisted module IDs:

- `awaken.pay-attention`
- `awaken.catch-yourself-being-you`
- `awaken.your-reactions-have-a-history`
- `awaken.formation-is-not-identity`

The actor comes from a server-verified Supabase session (`GET /auth/v1/user`),
not an email, command-line user ID, decoded JWT, or database lookup. The expected
actor UUID is an additional confirmation and must match the verified actor.
The transaction assumes role `authenticated`, sets that actor’s claims, locks
their selected progress rows, and uses explicit owner/module predicates as well
as existing RLS. Apply deletes progress and its cascading reflections, verifies
both are absent, then commits. A failure rolls back. Output contains only actor,
module IDs, counts, mode and verification status; no reflection text or tokens.

## Isolation requirements

Only the repository’s designated **local** Supabase project
`rts-phase1-prototype` is trusted. Auth must be `http://127.0.0.1:54321` and
PostgreSQL must be `127.0.0.1:54322/postgres`, without URL query overrides.
The command checks the current branch, local Supabase configuration, running
Docker project labels, container port bindings and shared local network before
authentication or database access. Conflicting app/database settings are rejected.
It accepts no user, module, URL, project-ref, all-users, linked, or workdir override.

**Hosted targets are deliberately refused**, including production and review
project `zxikzybpodxecgpkncix`. No independently verified hosted prototype database
identity was available when this command was authored. Do not relabel a hosted
environment or copy its credentials into the local reset configuration. A future
hosted implementation needs an independently verified, fixed isolated project
identity and its own isolation regression tests first.

## Exact execution steps

1. Check out `prototype/awaken-lived-journey` and run `npm ci`.
2. Use the already provisioned local prototype stack, with its existing migrations.
   Do not run a database reset or apply any schema changes as part of this command.
3. Sign in to that local prototype as the account to reset. Close lesson tabs so
   an in-flight save cannot recreate state after reset.
4. Create ignored file `.env.prototype-reset` locally with the following settings.
   Keep credentials out of shell arguments, logs, commits, and chat:

```dotenv
RTS_RUNTIME_ENV=isolated-prototype
SUPABASE_PROJECT_ID=rts-phase1-prototype
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<local anonymous key>
RTS_PROTOTYPE_DATABASE_URL=postgresql://postgres:<local password>@127.0.0.1:54322/postgres
RTS_PROTOTYPE_ACCESS_TOKEN=<current local authenticated access token>
RTS_PROTOTYPE_RESET_ACTOR_ID=<that session's user UUID>
```

5. Preview the counts; no delete occurs:

```bash
npm run reset:prototype:awaken -- --dry-run
```

6. Apply the reset and check `mode: "apply"` and `blank: true`:

```bash
npm run reset:prototype:awaken -- --apply
```

7. Run the dry run again. `progress` and `reflections` must both be `0`. Reopen
   or fully reload the local prototype to discard client-only inquiry turns and
   verify each of the four lessons starts fresh. A1 inquiry turns are client-only;
   `/api/ai/awaken-guide` uses `store:false`. This command does not delete OpenAI
   data, accounts, journal/formation records, or other curriculum progress.

Default invocation is dry run. Repeated apply is safe and reports zero deletions
when already blank. A new participant save after commit can create fresh state.

## Regression evidence

`node --test tests/harness/awaken-reset.test.mjs` uses disposable embedded
PostgreSQL (PGlite), with owner RLS and the composite cascading reflection FK.
It exercises the actual command SQL against two actors, A1–A4, unrelated
curriculum rows, dry-run preservation, repeat apply and rollback on failed
verification. Guard tests reject production/review environments and hosted URLs,
actor mismatch, missing authentication, wrong branches, missing Docker isolation,
and target overrides before any database connection. The regression fixtures
never connect to a hosted or participant database.

## Validation on 2026-10-01

- `npm test`: 4 passed.
- `npm run test:harness`: 48 passed, including 13 new reset tests.
- `npm run typecheck`: passed.
- ESLint could not run: the repository has no `eslint.config.js`, `.mjs`, or `.cjs` required by its installed ESLint 9.39.4. No lint configuration changes are included.
- `npm run test:unit`: 279 passed, 16 failed. A detached baseline at `f92d96adf64caea649ec113627f808feb2ab2b2a` produced the identical 16 failing test names. No curriculum/UI/auth fixes are included in this reset change.
- Hosted/local-stack integration and participant browser verification were not run: no isolated stack credentials, Docker runtime, or authenticated actor session were available. The actual reset was not executed.

Existing unit failures (unchanged from baseline):

- `unit/ai/import-boundary.test.ts` — OpenAI server boundary keeps OpenAI SDK/API imports below server/ai
- `unit/auth/review-route.test.ts` — review auth bootstrap creates a real session for only the designated review user
- `unit/components/a1-lesson.test.tsx` — A1 participant experience announces reflection success only after the server action resolves
- `unit/components/a1-lesson.test.tsx` — A1 participant experience does not enable saving whitespace-only reflections
- `unit/components/a1-lesson.test.tsx` — A1 participant experience keeps the entered reflection available after a failed save
- `unit/components/a1-lesson.test.tsx` — A1 participant experience presents Luke 6:45 as Scripture with a visible translation attribution
- `unit/components/a1-lesson.test.tsx` — A1 participant experience separates the outside event from the inside response as two readable observations
- `unit/components/a1-lesson.test.tsx` — A1 participant experience gives the A1 practice question a distinct, easily revisited emphasis
- `unit/components/a1-lesson.test.tsx` — A1 participant experience gives practice and carry-forward sections clear, distinct transition treatments
- `unit/components/a2-lesson.test.tsx` — A2 participant experience lets the participant connect situations to recurring responses without saving those choices
- `unit/components/a2-lesson.test.tsx` — A2 participant experience ignores incomplete selections and offers no pattern claim until two moments are complete
- `unit/components/a2-lesson.test.tsx` — A2 participant experience explains response families through an accessible disclosure without assigning identities
- `unit/components/a3-a4-lessons.test.tsx` — A3 separates identity from learned patterns begins with an observation and guides the participant one step at a time
- `unit/components/a3-a4-lessons.test.tsx` — A3 separates identity from learned patterns builds a direct wording comparison and accepts uncertainty without interpretation
- `unit/components/a3-a4-lessons.test.tsx` — A4 understands what may be moving underneath a response guides one recent moment through expectation, desire, fear, and importance
- `unit/components/a3-a4-lessons.test.tsx` — A4 understands what may be moving underneath a response allows “I’m not sure” and introduces threatened concerns only after teaching
