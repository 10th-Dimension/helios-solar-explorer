# Resizing, retries and evidence layout review

Owner request: resize the Education panel, repair overlapping source cards throughout the Site, keep retries simple and make shared-browser use clear for instructors. This is a subsequent main/Site update after the v1.1.0 release; the existing release tag is not rewritten.

The supplied screenshot exposed `.layers-list article` applying a four-column layer-row grid to nested scientific claim articles. Row rules now target direct children; evidence articles, badges, date fields and long identifiers have explicit document-flow styles. Drawer evidence expands in its existing scrolling parent instead of another constrained scroll box. Environment row selectors are also scoped to direct children to prevent the same collision.

The desktop divider uses pointer capture and keyboard controls, saves only a bounded local numeric width and preserves one renderer. The existing scene ResizeObserver handles the changed viewport. Arrow Left widens; Right narrows; Home/End choose bounds; Enter/double-click restores620px. Window resize clamps the rendered width without losing the preferred desktop width. Mobile uses the full-width reading/scene switch.

Retry question clears only the active answer. Retake lesson questions clears answers and returns to the first stage while preserving visits/alternatives and historical completion markers. A valid wrong attempt may continue; a cleared/unanswered question needs another attempt. Completion reports accuracy separately from participation. Teacher tools explain local storage and offer confirmed clearing for the next learner. No student account, roster, secure gradebook or attempt limit is introduced.

## Verification

Local production-build browser checks passed:

- Pointer drag moved the divider150px: lesson620→770px, scene620→470px, one canvas retained. Keyboard Left adjusted by24px; Home/End reached380/880px at1280px viewport; Enter restored620px. Reload retained770px. Shrinking the viewport to1000px clamped the pane to600px; returning to1280px restored770px.
- Wrong-answer attempts could continue. Retry question cleared the current selection and focused its first input. A four-question Sun journey completed with0/4correct and explicitly labeled completion as participation. Retake questions cleared answers, retained explored targets and returned to stage1. The next-learner reset showed confirmation; cancellation retained the current lesson.
- The supplied Sun Convective evidence case rendered as block text,268px wide on desktop and309px on mobile, without horizontal overflow; values followed titles with12px separation. Its drawer evidence had no inner scroll box.
- The shared evidence matrix covered layer cards, all16world-story claims, expanded metric/fact cards, five exoplanet catalog claims,16Science-dialog claims and two selected-interior claims. Tested cards stayed in block flow without horizontal overflow; title/value separation was verified where measured. Expanded metric and fact cards used the full528px grid row rather than narrow tiles. Mobile viewport/document widths both390px. Final captured browser warning/error log was empty.

All six repository suites, typecheck, lint and production build passed; full npm audit reported zero vulnerabilities. The education suite additionally verifies bounded/malformed width preferences, retry/retake state, incorrect-attempt progression, preserved observations/completion history and imperfect-completion persistence. Final public guard, history scan, CI and production acceptance are recorded in the PR/task delivery receipt. No finite review proves that every possible UI or device defect is absent; physical touch/screen-reader matrices and independent accessibility certification remain unverified.
