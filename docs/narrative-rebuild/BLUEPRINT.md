# Narrative-first app rebuild — implementation blueprint

Source of truth: **What Does It Mean to Reform the Soul?** (seven-page supplied document). Preserve 80–90% of its narrative verbatim across the completed experience. Do not paraphrase the source simply to fit screens. Keep its order.

## Safety and scope
- Isolated branch: `prototype/narrative-rebuild`. Do not change main, production, or existing review deployments.
- Build the opening and Awaken first, then review before continuing.
- Preserve existing authentication, owner-scoped progress, and reflections where possible; do not reset any data.

## Reading flow
1. Opening — Most of us begin the journey already deeply formed; learned protection and responses; came to God carrying it.
2. Awaken — the dismissal example, noticing what happens within, catching ourselves being ourselves.
3. See Clearly — beliefs, expectations, desires, intentions, behavior; beliefs about God; Jesus as the lens.
4. Become — release control, receive the moment, take the next right step, repeat; fruit.
5. Join — restored soul becomes available, relationships and participation.
6. Ending — the movements repeat as a way of living with God.

## Interlude design
- Opening: select which influences shaped you (optional, multiple choices); no psychological interpretation.
- Awaken: choose a real-life experience (questioned, unexpected change, overlooked, success); describe what happened and what arose within. AI may ask at most two context-aware follow-ups, not presume hidden motives.
- Awaken completion: reflect the person's own words; distinguish observation from speculation; return to the narrative.
- See Clearly: explore belief beneath response and what the person expects of God, without supplying a diagnosis.
- Become: practice the four-part daily loop on a real present situation.
- Join: identify one relationship or context for faithful participation.
- All interludes skippable. No compulsory self-disclosure. Explicit consent before saving reflections.

## UX requirements
- Spacious, mobile-first reading typography; narrative passages generally 2–5 paragraphs, with natural breaks.
- Distinct interlude visual treatment without jarring cards or excessive text boxes.
- Back, continue, and resume; visible stage progress; preserve scroll/read position.
- Vary interlude types: selection, short answer, observation, application. Avoid repetitive quizzes.
- AI guidance is optional and grounded in the user's actual words; say when inference is uncertain.
- Source narrative and interlude content must be stored separately for preservation auditing.

## Acceptance criteria
- Opening + Awaken functional in review before expanding.
- Verify narrative preservation quantitatively once all sections are mapped.
- Test at 375px, 768px, and desktop.
- Never silently mark an interlude complete or invent an answer.
- No changes to production data or deployments.

## Next implementation steps
1. Inspect current /deep-dive routes, shared styles, and progress model.
2. Create structured narrative passages with exact source text.
3. Implement opening reading screens and Awaken interlude as isolated route.
4. Test locally and produce preview evidence.
