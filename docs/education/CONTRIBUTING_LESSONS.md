# Contributing educational content

Keep the universe central. A lesson should lead learners through existing objects and controls, with an equivalent text path, rather than replace the scene with a slideshow.

## Before changing science

1. Identify the exact existing claim and its stable identifier, astronomical object and field.
2. Find a specific primary source: NASA/JPL, NASA Exoplanet Archive, CDS/SIMBAD, IAU standards or relevant peer-reviewed work.
3. Record publication/observation dates when the source supplies them. Record retrieval or verification separately; do not infer a missing date.
4. Explain the uncertainty, model assumptions and whether the quantity is measured, inferred, uncertain, unknown or illustrative.
5. Preserve the raw snapshots. A catalog refresh is a deliberate reviewed data change, not an install or build side effect.
6. Document disagreements instead of silently selecting the value you remember.

Confirmation, mass measurement, inferred radius and an illustrative surface are separate claims. Do not label a whole mixed-content story as measured, invent a citation or turn a missing value into zero.

## Add or revise a lesson

Use `app/education.ts` for structured definitions and the scientific source registry for claim references. Reuse existing IDs for planets, stars, destinations and interior layers. Add a stable lesson/stage ID, objectives, a short explanation, a scene task, its accessible alternative and a meaningful question with a correct-answer explanation. Keep wording understandable without prior astrophysics vocabulary.

Questions should test the concept the learner just explored. Wrong choices must be plausible enough to identify a misconception but must not teach false facts in the feedback. Do not introduce timers, rankings, student identities, analytics or server persistence as a side effect of a content contribution.

## Validation checklist

- Definition/state/source checks pass, as do `npm test`, `npm run typecheck`, `npm run lint`, `npm run audit:public` and `npm run build`.
- All destination and layer IDs exist and navigate through the existing scene adapter.
- A learner can finish, pause/resume, exit, restart and recover Home.
- Keyboard focus is visible; every answer and task can be operated without a pointer.
- The text alternative carries the same scientific learning objective without requiring visual canvas interpretation.
- Source references resolve and confidence labels accurately characterize the individual claim.
- Changes to scientific records keep provenance and explicit limitations.
- Screenshots come from the real application and include useful alt text.
- Documentation records the actual browsers/viewports and any verification limits.

Use the scientific-correction or education/accessibility issue forms for focused reports. A performance report should include browser, approximate hardware, viewport, quality tier, action and whether the problem is reproducible. Remove personal or credential information before attaching logs.

## Rights

MIT covers original code and text, not every source dataset or external image. Preserve `THIRD_PARTY_NOTICES.md` and `public/ASSET_PROVENANCE.md`. Link to media when redistribution rights are unclear. Do not bundle commercial music, including the original Interstellar soundtrack.
