# Awaken A1–A4 AI guidance verification

Review-only scope. Main, production data, database schema, and other curriculum are unchanged.

All four active exercises call the authenticated same-origin `/api/ai/awaken-guide` endpoint. The server selects a distinct lesson objective, sends only the current participant conversation, and uses OpenAI Responses with `store:false`. Conversations stay in client memory; only participant-approved reflection edits use the existing persistence mechanism. No fixed prompts are silently substituted when AI fails.

One question at a time. Completion follows the lesson outcome, with a check-in after three exchanges, an eight-question upper limit per exercise, and a tap-out option throughout. Model observations are tentative and must be confirmed or corrected. Uncertainty and no connection are valid endings.

Punch list: six A2 opening examples; purposeful comparison; responsive reflection that carries the A2 conversation forward; no A2 code in A3 teaching; establish A4 event and reaction; acknowledge overlapping answers; avoid forced deeper motives; replace the four-box questionnaire; distinguish exercise and section continuation.

Validation before preview deployment:
- 36 changed-flow tests passed.
- Typecheck and Next.js production build passed.
- 49 harness tests passed, including 14 temporary scoped reset tests.
- Standard npm test: 4 passed.
- Full unit suite: 19 failures, all reproduced on the original review tree; no new failures. Original review baseline had 26 failures.

Existing unit failures (outside this change):
- OpenAI server boundary keeps OpenAI SDK/API imports below server/ai
- review auth bootstrap creates a real session for only the designated review user
- A1 participant experience announces reflection success only after the server action resolves
- A1 participant experience does not enable saving whitespace-only reflections
- A1 participant experience keeps the entered reflection available after a failed save
- A1 participant experience presents Luke 6:45 as Scripture with a visible translation attribution
- A1 participant experience separates the outside event from the inside response as two readable observations
- A1 participant experience gives the A1 practice question a distinct, easily revisited emphasis
- A1 participant experience gives practice and carry-forward sections clear, distinct transition treatments
- completed Awaken lesson navigation a3 presents a forward link and a quiet route back to Awaken
- SC1 guided lesson labels distinct participant fields and lets review edit the original wording
- See Clearly stage continuation keeps the lesson review links and gives the hub a journey return
- See Clearly movements shows two module groups with only the built SY1 lesson as an action
- See Clearly movements opens completed SY1 from entry for review
- See Clearly movements offers SY2 after SY1 and keeps SY3 as the next group item
- See Clearly movements offers SY3 after SY2 and marks SY4 next only after SY3 completion
- See Clearly movements opens SG1 after SY4 completion and marks SG2 next after SG1 completion
- See Clearly movements opens SG3 only after SG2 completion and makes SG4 the next stage item after SG3
- See Clearly movements opens SG4 after SG3 and keeps completed See Clearly available for review

Live preview verification:
- A1 returned a relevant question after a disposable traffic example.
- A2 explained the purpose of a second moment. Guided reflection accepted no connection without claiming insight.
- A3 asked about the actual self-description after the observed behavior.
- A4 asked how the participant reacted after the event description.
- These live checks exposed over-questioning; final instructions explicitly accept no second example, accept concrete behavior without re-asking, and stop A4 once a shaping factor is honestly named. The UI now explicitly checks readiness after three answered questions.
- Scoped authenticated reset removed four Awaken progress rows and one reflection; its transaction verified all four modules blank. A later authenticated dry run confirmed zero progress and zero reflections after disposable live testing.
- Temporary reset endpoint/service/test removed from the final source.

Final preview checks after stopping refinements:
- A2: a first response explicitly saying no second example/no pattern completed immediately without a pattern claim.
- A3: behavior plus self-label moved directly to their difference; a participant explanation of that difference completed with a tentative observation requiring confirmation.
- A4: event plus braking/anger and fear of collision completed immediately with a grounded safety observation requiring confirmation.
- Reset endpoint returned 404 after cleanup.
- Final full unit suite: 289 passed, 19 baseline failures; final harness: 35 passed after removing the temporary reset tests.
