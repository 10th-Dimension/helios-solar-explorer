# HELIOS Education 1.0 progress

Status: IN PROGRESS. Feature branch `feat/helios-education-1-0`; starting main `c208dcab8a5d04b806186c54ce7137a776fd0ddb`. Existing production hosting is out of scope. No merge, production release or hosting mutation is authorized by this assignment.

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
- [ ] Phase 1: structured claims, confidence/date semantics, source UI, source audit and adversarial scientific checks.
- [ ] Phase 2: four complete lessons, real scene actions, questions/retry, completion, local pause/resume and text alternative.
- [ ] Phase 3: keyboard/mobile/focus/reduced motion; bounded performance/resource investigation; dependency/security review; educator resources.
- [ ] Phase 4: README/architecture, contributor templates, launch kit, release notes, validation summary, standalone demo instructions.
- [ ] Full final verification, browser journeys, reviewable commits and PR.

## Constraints and pending verification

- User requires usage checks every 30 seconds during work and a saved checkpoint/pause at 2% remaining. Latest checked remaining: 23%. Do not claim this figure is continuously current.
- No separate authorized non-production deployment target is known. Existing production Site must remain untouched; a deployable local production build and exact instructions will be prepared if no target is available.
- No classroom certification, full WCAG conformance, exhaustive scientific verification, sustained GPU or leak-free claim is established.
- Browser/accessibility/performance results remain pending and must be recorded by exact exercised path.

## Resume point

Baseline is complete. Three independent workstreams are implementing science, lessons and readiness documents on this shared feature branch. Integrate their stable APIs into page.tsx and CSS; resolve inherited dependencies; verify all four phases rather than stopping after the science registry.
