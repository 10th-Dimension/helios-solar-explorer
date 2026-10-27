# Education 1.0 learning workspace review

Package/release: `1.1.0`; product: Helios Education 1.0. Review date: 2026-10-24 Pacific. [Live public Site](https://helios-solar-explorer.eager-ape-4538.chatgpt.site/).

The previous layout put a long lesson, evidence, quiz and navigation into a 430px sidebar. The redesign uses a wide two-column library, a reading workspace up to 620px beside a resized existing scene, 16px body text, larger answer targets and a persistent navigation footer. The existing renderer's ResizeObserver updates its aspect ratio; no second scene or canvas is created.

View scene folds the reader to expose the scene. Read lesson restores it. Small-screen scene-target actions fold automatically, except comparisons which open the existing modal. The written alternative remains a complete route through every lesson. Source bodies expand in the reading flow rather than creating a second constrained scrollbar.

Interaction repairs include closing conflicting Catalog/Worlds overlays, preserving local progress during mode changes, resetting the reader's own scroll on stage changes without scrolling the universe, canceling pending replacement/deletion confirmation with Escape before closing Education, and keeping navigation/hints visible outside the reading scroll area.

All scientific content, four lessons, 21 stages and 16 questions are retained. Source coverage remains 514 claims / 130 references, with original confidence, verification, date and uncertainty boundaries. [Science audit](../SCIENCE_AUDIT.md) and [original candidate validation](../EDUCATION_VALIDATION.md) preserve the earlier evidence rather than being relabeled as tests of this redesign.

## Verification record

PASS: the production-build browser regression pass completed all four lessons. Sun, Planets and Beyond used actual scene targets/layers/comparison; Solar System used all nine written alternatives and four questions at 390×844. The existing six test suites also pass. Final CI is available on the release commit/PR; production acceptance is reported in the GitHub release after deployment, separately from these local results.

| UI path | Observed result |
| --- | --- |
| Desktop reader/library | At 1280px, library width 1120px with two columns; lesson reader 620px with a separately resized scene. One canvas remained. |
| Navigation and quizzes | All 21 stages completed across the four journeys. Wrong answer kept progression disabled; corrected answer plus observed target enabled it. Footer remained separate from scrolling content. |
| Stage change | Reader reset to the new heading; window scrollX/scrollY stayed zero. |
| Scene/reading | Desktop View scene / Read lesson worked. At 390px, scene navigation folded the reader automatically; Read lesson restored the quiz. |
| Confirmation/Escape | Escape canceled pending lesson replacement and saved-progress deletion confirmation while keeping Education open. No progress was deleted. |
| Mode overlap | Opening Catalog closed Education and displayed Catalog; lesson progress remained browser-local and recoverable. Education entry clears conflicting information, quick-travel and comparison overlays. |
| Evidence | Mobile source disclosure opened with source-reviewed confidence information; content expands in the reader flow. |
| Narrow screen | 390px viewport/document widths matched; at 320×568 there was no horizontal overflow, footer bottom was555px and window scroll stayed zero. Physical touch is not implied. |

Actual captures: [library](../images/education-library.jpg), [reader](../images/education-workspace.jpg), [mobile completion](../images/education-workspace-mobile.jpg).

A request for no UI bugs cannot establish proof that no bug exists. These are actual exercised paths, not an exhaustive browser/device or assistive-technology certification. The earlier public-host guard intentionally rejected all ChatGPT Site URLs; it now permits only the owner's explicitly approved exact public origin while negative checks continue rejecting other Site hosts, suffix lookalikes and deployment IDs. Other secret/path rules remain active.

## Release limits

Historical catalogs, inferred interiors/radii and procedural visual activity remain disclosed. Physical mobile/touch, screen-reader combinations, OS reduced-motion visual acceptance, independent WCAG conformance and sustained GPU/leak qualification are not established by desktop viewport tests. The release is educational software, not a certified curriculum or gradebook.
