# Helios Education 1.0 — v1.1.0

[Launch the live public Helios Site](https://helios-solar-explorer.10thdimension.chatgpt.site/) · [Source repository](https://github.com/10th-Dimension/helios-solar-explorer)

Education 1.0 turns Helios's continuous 3D universe into a guided learning space. The full application is available as MIT-licensed open source; historical NASA image assets retain their separate provenance notices.

## A roomier place to learn

- Spacious two-column lesson library and a wider reader beside the existing 3D scene.
- Larger text and answer choices, persistent Previous/Next controls, and clear explanations when progression is disabled.
- View scene / Read lesson switching; small-screen scene navigation reveals the object instead of leaving it covered by a reader.
- Source disclosures expand in the reading flow, and teacher/student guides are available directly from Education.
- Conflicting overlays close when switching modes. Stage changes reset the reader rather than scrolling the universe. Escape cancels a pending progress confirmation before exiting.

## Four complete journeys

| Lesson | Stages | Questions |
| --- | --- | --- |
| Our Solar System | 9 | 4 |
| Inside the Sun | 4 | 4 |
| Inside the Planets | 4 | 4 |
| Beyond Our Solar System | 4 | 4 |

The 21 stages use existing navigation, interiors and planetary comparison. All 16 knowledge checks include feedback and retry. Every stage provides an explicit written alternative. Progress stays in local browser storage with pause/resume, completion review and protected restart/replacement; no learner account or remote gradebook is required.

## Evidence alongside the experience

A registry of 514 claims and 130 sources separates confidence from verification status and distinguishes publication, observation, retrieval and review dates. Original scientific snapshots and numerical world data are preserved. Missing values remain unknown; modeled interiors, inferred planet properties and illustrative solar/auroral activity remain disclosed. Counts describe coverage, not blanket scientific verification.

The release also retains the Sun and eight planets, Planet Stories, environments, cutaways, Earth imagery and auroras, 83 stellar/substellar records, 65 selectable anchors and 24 curated confirmed exoplanets.

## Use and contribute

Run with Node.js 24: clone the repository, run `npm ci`, then `npm run dev`. Open the local address printed by the server. No ChatGPT Sites account, hosting credentials or database is required.

- [Teacher guide and answer key](https://github.com/10th-Dimension/helios-solar-explorer/blob/v1.1.0/docs/education/TEACHER_GUIDE.md)
- [Student guide](https://github.com/10th-Dimension/helios-solar-explorer/blob/v1.1.0/docs/education/STUDENT_GUIDE.md)
- [Printable learning sheet](https://github.com/10th-Dimension/helios-solar-explorer/blob/v1.1.0/docs/education/learning-sheet.html)
- [UI review and verification](https://github.com/10th-Dimension/helios-solar-explorer/blob/v1.1.0/docs/education/WORKSPACE_REVIEW.md)
- [Scientific audit](https://github.com/10th-Dimension/helios-solar-explorer/blob/v1.1.0/docs/SCIENCE_AUDIT.md)

## Verification and limits

Repository tests cover stellar snapshots, aurora geometry, wheel easing, solar geometry, claim/source relationships and all education state paths. Actual browser checks are recorded separately in the workspace review; a build is not a UI pass.

This release is not independently classroom- or WCAG-certified. Historical catalog dates, scientific uncertainties, physical mobile/touch and screen-reader combinations, OS reduced-motion visual acceptance, and sustained GPU/memory qualification retain their documented limits. Hosting operators remain responsible for deployment security. No claim of a completely bug-free application is made.
