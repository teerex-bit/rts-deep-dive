# RTS Deep Dive Review

This branch is the stable review surface for the isolated RTS Deep Dive application.

## Boundaries

- Production: `main` — do not use for review testing.
- Certified protected review: `review` — remains unchanged.
- Review database candidate: `review-db-candidate` — remains unchanged.
- Stable review branch: `review-deep-dive`.
- Current review source is intentionally isolated from production data and schema.

## Review workflow

Push approved review changes to this branch. Vercel Preview should deploy the branch and update its branch URL. Review testing uses the Preview environment and the isolated review authentication/database configuration.

Automated access uses Vercel Deployment Protection's automation bypass. The bypass secret must remain in Vercel environment settings and must never be committed here.

The review application should use the existing review-only authentication path at `/auth/review` when its review environment variables are configured.

## Current baseline

The branch was created from the isolated Awaken lived-journey prototype at:

`6e3364cbb967d1b3e526a4149c3f2b598c85a434`

No production branch or production database is changed by this review branch.
