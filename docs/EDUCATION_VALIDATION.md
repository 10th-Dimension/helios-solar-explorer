# Education 1.0 candidate validation

Review date: 2026-10-24 (America/Los_Angeles). Package: `1.1.0-rc.1`. Branch: `feat/helios-education-1-0`. Baseline: `c208dcab8a5d04b806186c54ce7137a776fd0ddb`. This is a release candidate for review; no production deployment or merge is authorized by this assignment.

## Implementation and scientific scope

**COMPLETE:** four lessons, 21 stages and 16 questions; observed scene-target gates; correct/incorrect feedback; explicit written alternatives; local pause/resume/restart and completion review; per-claim evidence disclosures; native modal focus and inert closed panels; manual motion pause and an OS preference implementation.

The registry contains 514 claims and 130 sources. These counts describe coverage, not 514 independently verified facts. Confidence and verification status are separate. Publication, observation, retrieval and review dates remain distinct and nullable. The [science audit](SCIENCE_AUDIT.md) records reviewed NASA/JPL educational concepts, preserved snapshot comparisons and unresolved scalar provenance. Raw catalog snapshots, world data and legacy scientific values were not rewritten.

**PARTIAL:** scientific reconciliation. Moon-count dates, differing gravity definitions, the Sun radius ratio and original Proxima provenance have explicit unresolved notes. Giant-planet boundaries, inferred radii, missing values and illustrative activity retain their limits. Neither a catalog match nor a source link independently confirms every claim.

## Actual production-build browser acceptance

Tested the local production build at `http://127.0.0.1:3001/` in the Codex Chromium-based in-app browser. These were actual UI actions, not simulated reducer observations. No installed cross-browser or CI browser matrix is claimed.

| Path | Observed result |
| --- | --- |
| Inside the Sun, four stages | Completed using actual Core, Radiative, Convective and Photosphere + atmosphere controls. An incorrect answer kept Next disabled; correct responses and scene observations enabled progression. |
| Inside the Planets, four stages | Completed through actual Earth Mantle, Jupiter Metallic hydrogen, Neptune Volatile-rich interior and Neptune/Earth comparison. Dialog displayed radius 3.86×, mass 17.1× and gravity 1.14×. |
| Beyond Our Solar System, four stages | Completed Proxima travel, Proxima b approach, host return and Home. Rechecked the corrected lesson action: the exoplanet selection cleared and the scene returned to STELLAR_SYSTEM / Proxima destination frame. |
| Our Solar System, nine stages | Completed every written alternative and all four questions at 390×844. Completion explicitly reported nine written alternatives rather than claiming visual scene visits. |
| Persistence | Pause, exit, reopen and resume retained the Sun lesson stage. Completed attempt reopened its completion summary and library offered Review completion; restart behavior also has reducer coverage. |
| Evidence | Opened a real lesson claim, confidence/status, limitations and review date. Closed bodies mount lazily; opening on mobile populated the claim content. |
| Keyboard dialogs | Comparison Tab stayed in the modal; Escape closed and returned focus to its lesson opener. Science Shift+Tab from its close button stayed inside the dialog; Escape returned focus to SCIENCE. |
| Existing exploration | Ordinary Worlds → Earth → System worked after lessons; aurora preview retained its on/off control. One canvas remained throughout tested transitions and quality changes. |
| Browser errors | Final captured warning/error log was empty. This does not constitute an exhaustive log history or cross-browser qualification. |

The mobile panel scrolled to questions/actions and source details. Document width equaled viewport width (390 pixels), with no horizontal page overflow. AUTO selected BALANCED / 3,500 decorative stars. This is viewport emulation on a desktop machine, **not a physical phone or touch/pinch test**. [Mobile completion capture](images/education-mobile-complete.jpg), [mobile quiz capture](images/education-mobile.jpg), and [Sun completion capture](images/education-sun-complete.jpg) are actual application screenshots.

**NOT VERIFIED:** independent WCAG conformance, screen-reader combinations, physical mobile devices, touch gestures and OS reduced-motion visual acceptance. The available browser exposed viewport and visibility capabilities, but no OS media emulation. Manual PAUSE MOTION was verified separately: its visual clock remained fixed across manual travel while navigation still worked. Source implementation alone is not OS visual acceptance. The default animated path was exercised before pausing.

## Measured performance and resource scope

The existing renderer remains one scene, one canvas and one animation loop. Frame diagnostics measure render-loop CPU submission and frame intervals; they do not measure GPU duration or certify a sustained frame rate.

| Bounded sample | Mean loop CPU | Worst interval | Other observed counters |
| --- | --- | --- | --- |
| Initial desktop ULTRA overview, 60 frames | 1.54 ms | 16.80 ms | 86 draw calls; 78 geometries / 18 textures; 16,000 decorative stars |
| Proxima frame, 60 frames | 1.37 ms | 16.80 ms | 24 draw calls; 104 geometries / 19 textures |
| Home after first journey, 60 frames | 1.45 ms | 16.80 ms | 110 draw calls; 109 geometries / 20 textures |
| Narrow AUTO/BALANCED sample, 60 frames | 1.80 ms | 16.80 ms | 69 draw calls; 141 geometries / 23 textures; 3,500 stars |
| Later HIGH overview, 61 frames | 2.04 ms | 17.10 ms | 86 draw calls; 150 geometries / 23 textures; 9,000 stars |
| Later BALANCED overview, 60 frames | 2.11 ms | 17.10 ms | 86 draw calls; 152 geometries / 23 textures |

These are different scene/viewport/quality states, not an A/B speed comparison. Counts rose as new assets and quality geometries were uploaded. Three subsequent Earth/overview cycles at HIGH held 150 geometries / 23 textures with one canvas; this short observation does not establish leak freedom. Long-session GPU/memory and low-end device testing remain **NOT VERIFIED**.

Measured UI overhead justified one narrow optimization: closed evidence initially contributed 866 descendant nodes within 1,836 total DOM nodes. Lazy body mounting reduced the tested closed state to zero source-body descendants / 959 total nodes; opening one mobile disclosure mounted 66 descendants correctly. States differ slightly, so this is a closed-disclosure DOM finding, not a frame-rate claim. No renderer quality downgrade was introduced to claim an unmeasured gain.

## Automated, security and delivery checks

The candidate test command includes original stellar/snapshot, aurora, wheel and solar suites plus science-graph and education-state suites. Science tests cover invalid/dangling citations, dates, confidence, unknown values, unit/record contracts and immutable snapshot hashes. Education tests exercise all 21 stage paths, invalid observations, wrong answers, persistence bounds, replacement protection and completion/restart migration. See the final PR checks for the exact reviewed commit.

Final local checks passed on application commit `7591825f9013f4c815d1f99de660e9668c2ff213` with Node `24.19.0` / npm `11.17.0`. Subsequent evidence-only commits do not change application code. See [progress](EDUCATION_PROGRESS.md) and the PR for delivery/CI identity.

| Final local check | Result |
| --- | --- |
| `npm test` | PASS: all six suites, including 514 claims / 130 sources, 11 adversarial graph cases and all lesson state paths |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run audit:public` | PASS: 87 tracked files, no findings |
| `npm run build` | PASS |
| `npm audit --json` | PASS: zero vulnerabilities across reported severities |
| Gitleaks 8.30.1, reachable history `--all`, redacted | PASS: 33 commits / approximately 1.20 MB scanned, no leaks at the application commit |
| Local documentation links/anchors | PASS: 24 Markdown files, 75 local links/anchors, zero failures |
| `git diff --check` | PASS |

CI enforces the repository checks and its history secret scan; actual CI status must be read from the PR rather than inferred from local results. Build retained large-client-chunk, bundler debug-name and Vinext route-classification notices; they were not suppressed. No generated build files are published in source.

The baseline full npm audit reported three high affected packages. The candidate uses `image-size@2.0.3` scoped under Vinext and transitive `zod@4.6.7`; a subsequent full audit reported zero vulnerabilities. React/Vinext were retained. The image parser read all four bundled images with their expected dimensions. Local HTTP checks returned 200 for root/PNG/NASA JPEG and 404 for a missing route. See [security review](EDUCATION_SECURITY.md) for advisories and host-level limits. A clean audit/secret scan is dated evidence, not a penetration test or guarantee.

## Release decision and blockers

**COMPLETE:** deployable local production candidate, educator/student/contribution guides, printable learning sheet, launch copy, release notes, issue templates and architecture documentation.

**BLOCKED:** an actual public staging demo. No separate authorized non-production host was configured. The existing hosted Helios Site was not changed; no second Site was created. [Deployment instructions](education/DEPLOYMENT.md) specify runtime, headers, rollback and actual-host acceptance checks.

**NOT PUBLISHED:** production release, merge and promotional posts. To authorize production, the owner must review the PR and its exact head/CI, accept the disclosed scientific/accessibility/security limits, approve the merge/release, and name the existing production target, intended audience and rollback. A new staging service additionally needs an approved target/account/access/cost choice. This candidate is not classroom-certified.
