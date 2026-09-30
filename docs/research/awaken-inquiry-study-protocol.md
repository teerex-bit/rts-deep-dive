# RTS Awaken Inquiry Evaluation Study Protocol

**Protocol version:** 0.1.0  
**Status:** Prospective / pre-results  
**Date initiated:** 2026-09-29

## 1. Purpose

Evaluate whether the Reforming the Soul (RTS) Awaken inquiry can help a participant notice one supported aspect of a lived moment more clearly without leading, diagnosing, imposing a pattern, or over-processing the moment.

Primary criterion:

> The next question should make sense because of what the participant just said.

The goal of Awaken is awareness, not diagnosis.

## 2. Governing RTS principles

- **Hardwired and held loosely.**
- **You don't do all of them through one process. You do all the process for one of them.**
- One moment is not a pattern.
- Similarity is not proof of a pattern.
- RTS may surface observations; the participant remains the discerner.
- Stop when the participant can see something supported that was not clear at the beginning.

## 3. Study design

Mixed-source evaluation corpus with three explicitly separated source classes:

### A. Real-world human language
Existing research datasets containing human-authored emotional or everyday language.

### B. Hybrid runs
Real human source text used as the starting material; any RTS-specific continuation is synthetic and must be labeled synthetic.

### C. Fully synthetic stress tests
Used for adversarial, rare, regression, and safety cases. Never represented as real-world evidence.

No synthetic hidden state may be attributed to a real source author as fact.

## 4. Initial real-world sources

### GoEmotions
Human-authored Reddit comments; 58,009 examples labeled with 27 emotions plus neutral. Use for language realism, emotion diversity, neutral/positive cases, and initial-moment sampling. Preserve source provenance and license metadata.

### EmpatheticDialogues
Approximately 25,000 conversations grounded in emotional situations. Use as research-validation material subject to its license. Do not silently convert inferred internal states into ground truth.

### DailyDialog
Human-written everyday multi-turn dialogue with emotion and communication-intent annotations. Use to test ordinary/non-pathological language and conversational realism, subject to dataset terms.

### ESConv
Emotional-support conversations with support-strategy annotations. Use as research comparison material for conversational progression and question/response behavior, subject to dataset terms.

## 5. Provenance requirements

Every study item must record:

- source dataset
- source item identifier when available
- source version/retrieval date
- license/terms status
- whether each field is REAL, SYNTHETIC, MODEL-CONNECTED, or EVALUATOR-INFERRED
- transformations applied
- model/prompt version for synthetic extensions
- exclusion reason if removed

Never merge these provenance classes.

## 6. Data minimization

Do not scrape live vulnerable-person forums, counseling forums, prayer requests, or private/semi-private communities for this study.

Use established research datasets and later explicitly consented RTS data.

Do not attempt to identify source authors.

Do not enrich records with external personal information.

## 7. Inquiry evaluation dimensions

Evaluate independently:

- next-question relevance
- coherence
- responsiveness
- repetition
- unsupported assumption
- leading behavior
- overreach
- missed signal
- respect for uncertainty
- useful depth
- over-drilling
- participant agency
- thread discipline
- confirmation-seeking
- premature pattern formation
- unnecessary pathologizing
- stopping quality
- synthesis fidelity
- unsupported invention

Do not collapse these into a single headline score for analysis.

## 8. Thread discipline

If multiple possible threads appear, RTS should normally remain with one participant-supported thread rather than attempting to process all of them.

The inquiry should not create additional work merely because other material surfaced.

## 9. Pattern safety

Flag any question or synthesis that:

- generalizes from one event;
- asks the participant to search for confirming examples of an AI-proposed pattern;
- treats semantic similarity as proof of a recurring pattern;
- turns a moment-specific statement into identity;
- presents model inference as participant fact.

## 10. Stopping rule

The core stopping question is:

> Can the participant now see something about this moment that was not clear when they started?

If yes, additional depth requires a specific participant-supported reason.

Awaken is not intended to explain the whole person.

## 11. Real-world validation rule

RTS may connect two or more directly observed elements in source material even if the original author did not articulate the connection.

Such relationships must be labeled **MODEL-CONNECTED**, not source fact.

The study must distinguish:

- OBSERVED: directly present in human-authored source material;
- CONNECTED: relationship proposed between observed elements;
- INFERRED: explanatory proposition not directly present.

Inferences are hypotheses, not ground truth.

## 12. Reproducibility

Every batch records:

- study protocol version
- corpus manifest version
- inclusion/exclusion rules
- scenario/sample IDs
- inquiry prompt version
- inquiry model/version
- simulator prompt/model where used
- evaluator prompt/model
- model settings
- code SHA
- execution environment
- run timestamp
- failures/retries
- token usage
- latency
- estimated cost

No prompt/model changes within a fixed comparison batch.

## 13. Analysis plan

Report:

- results by evaluation dimension;
- distributions, not only averages;
- failure counts and representative traces;
- results stratified by real/hybrid/synthetic provenance;
- positive/neutral versus difficult moments;
- terse versus detailed language where available;
- stopping behavior;
- confirmation/pattern-safety failures;
- thread-discipline failures;
- evaluator disagreement;
- technical failure rate and cost.

## 14. Human review

Automated evaluation is not final authority.

Preserve a preregistered random human-review sample plus automatically surfaced failure cases. Reviewers should be blinded to evaluator conclusions where practical.

## 15. Change control

After a fixed batch, freeze results before changing the inquiry engine.

Any change creates a new prompt/code version. Comparative runs should reuse the same fixed corpus whenever possible.

## 16. Future consented RTS data

If real RTS participant interactions are later used for research/evaluation, establish explicit consent, de-identification, retention, access, and withdrawal procedures before including them. Do not treat normal product participation as research consent.

## 17. Current limitations

Public research corpora are not representative of all RTS participants. Reddit-derived language has demographic/platform biases. Emotional-support corpora may overrepresent distress. Dataset labels do not establish theological or formation ground truth. AI evaluators may share model biases with the systems being evaluated.

These limitations must accompany reported conclusions.
