# HELIOS Education 1.0 progress

> Historical candidate checkpoint. PR #15 subsequently merged and Education was deployed to the existing public Site with owner approval. See [the learning workspace review](education/WORKSPACE_REVIEW.md) for the subsequent release and UI redesign; the dated checkpoint below is retained as evidence.

Status: IMPLEMENTED AND LOCALLY VERIFIED; REVIEW PR OPEN. Feature branch `feat/helios-education-1-0`; starting main `c208dcab8a5d04b806186c54ce7137a776fd0ddb`. Existing production hosting is out of scope. No merge, production release or hosting mutation is authorized by this assignment.

## Execution plan and ownership

1. Baseline and inspect existing contracts; preserve one renderer/canvas, scientific snapshots and ordinary navigation.
2. Build structured scientific claims/source metadata and compact source disclosures; audit selected important claims with visible unresolved gaps.
3. Build four structured lessons, questions, interaction gates, accessible text alternatives, pause/resume and completion.
4. Integrate lessons with existing page navigation, interiors and comparison state. Add focus/keyboard/overlay improvements and profile before targeted renderer work.
5. Review dependencies and publication safety; prepare teacher/student/contributor resources, launch kit and release candidate documentation.
6. Run all repository checks and actual production-build browser journeys. Push reviewable commits and open a PR. Do not merge or publish production.

Workstreams: science owns science registry/SourceInspector/verification/audit; lessons owns education definitions/state/panel/tests; readiness owns educator/launch/security documents and contribution templates; main agent owns integration, CSS, runtime changes, dependency changes, full verification and delivery.

## Baseline evidence — 2026-10-24

- Clean main matched origin/main at the starting SHA; created dedicated feature branch.
- PASS: npm test (stellar/data, aurora geometry, wheel, solar); npm run typecheck; npm run lint; npm run audit:public (61 tracked files, no findings); npm run build.
- Build notices: large client chunk and Vinext route classification notice inherited.
- Full npm audit: FAIL, three high affected packages: image-size 2.0.2 via Vinext 1.0.0-beta.3, and Zod 4.4.3 through lint tooling. No critical findings. Investigating patched image-size 2.0.3 and Zod 4.6.6 without a broad runtime migration.
- Existing tests authenticate 83 stellar/substellar sources, 65 anchors, 64 generic destinations and 24 confirmed planets. These are snapshot counts, not a current complete astronomical census.
- Original raw snapshots and world/scientific values have not been modified.

## Checklist

- [x] Read request, establish persistent goal and baseline, create feature branch.
- [x] Phase 1 implementation: structured claims, confidence/date semantics, source UI, source audit and 11 adversarial graph checks. Exact legacy scalar reconciliation remains explicitly partial; see SCIENCE_AUDIT.md.
- [x] Phase 2 implementation: four lessons, 21 stages, 16 questions, observed scene gates, text alternative and validated local persistence. All four browser journeys completed: Sun/Planets/Beyond through scene controls, Solar System through nine written alternatives at 390×844.
- [x] Phase 3 implementation and bounded review: keyboard/mobile/focus checks, manual motion pause, measured DOM optimization, CPU/resource samples, dependency/security review and educator resources. OS preference visual acceptance, physical mobile, screen-reader matrix and sustained GPU/leak qualification remain NOT VERIFIED.
- [x] Phase 4 source materials: README/architecture, contributor templates, launch kit, release notes, validation summary and standalone staging instructions. Actual public staging is BLOCKED by absence of a separately configured authorized target.
- [x] Full final local verification, browser journeys, reviewable commits and [PR #15](https://github.com/10th-Dimension/helios-solar-explorer/pull/15). CI runs on every PR update; inspect its latest head/checks before approval.

## Constraints and pending verification

- User requires usage checks every 30 seconds during work and a saved checkpoint/pause at 2% remaining. Latest checked remaining: 15%. Do not claim this figure is continuously current.
- No separate authorized non-production deployment target is known. Existing production Site must remain untouched; a deployable local production build and exact instructions will be prepared if no target is available.
- No classroom certification, full WCAG conformance, exhaustive scientific verification, sustained GPU or leak-free claim is established.
- Exact browser/accessibility/performance results and remaining limits are recorded in [candidate validation](EDUCATION_VALIDATION.md).

## Resume point

Final local checks at application commit `7591825f9013f4c815d1f99de660e9668c2ff213`: all six test suites, typecheck, lint, 87-file public guard, production build and full zero-vulnerability npm audit passed. Gitleaks scanned 33 commits / about 1.20 MB with no leaks at that application commit. All 75 local documentation links/anchors across 24 Markdown files resolved. Local test tab/server were closed. Review [PR #15](https://github.com/10th-Dimension/helios-solar-explorer/pull/15), which is open, attached to this chat and unmerged. [GitHub verification runs](https://github.com/10th-Dimension/helios-solar-explorer/actions/workflows/verify.yml) carry final remote evidence; the first candidate run was in progress when this evidence note was saved. Do not infer its latest result from that historical state. No production or staging deployment was performed. Remaining owner decisions are the PR review/approval and any explicit merge, release and hosting authorization described in validation. The longer implementation recap below preserves the preceding checkpoint.

Science/lesson/readiness workstreams and actual browser acceptance are integrated. Candidate full audit is zero after image-size 2.0.3 override and Zod 4.6.7 update, retaining Vinext. Patched metadata parser read all four bundled image assets. Prior full tests, typecheck, lint and production build passed. All four actual browser lesson paths passed; host-return correction rechecked; mobile alternative completed; native modal focus/return checks passed. Closed evidence bodies are now lazy-mounted after measuring 866 unnecessary descendants. Three Earth/overview repeats held 150 geometries / 23 textures at HIGH, with one canvas; no sustained leak claim. Remaining work: final staged-file guard, full repository checks/secret scan, docs link audit, commit/push, reviewable PR and CI result. Do not merge or deploy production. Check usage and checkpoint/pause at 2%.
