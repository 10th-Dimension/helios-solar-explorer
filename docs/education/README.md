# Helios Education 1.0

Helios keeps the 3D universe as the main interface. Education adds guided questions, explanations and source inspection to the existing scene. Free exploration remains available.

This documentation accompanies Helios Education 1.0, package/release `1.1.0`. [Open the live public Site](https://helios-solar-explorer.chasewilcox93.chatgpt.site/). It is not a statement of curriculum accreditation, WCAG conformance certification or independently validated classroom outcomes.

## Start here

- [Student quick start](STUDENT_GUIDE.md)
- [Education feature guide](FEATURE_GUIDE.md)
- [Teacher getting-started guide and activities](TEACHER_GUIDE.md)
- [Printable learning sheet](learning-sheet.html), which can be opened in a browser and printed without external fonts or scripts
- [Adding or correcting educational content](CONTRIBUTING_LESSONS.md)
- [Known limitations](KNOWN_LIMITATIONS.md)
- [Standalone demo deployment](DEPLOYMENT.md)
- [Launch kit](LAUNCH_KIT.md)
- [Release notes](RELEASE_NOTES.md)
- [Candidate validation evidence](../EDUCATION_VALIDATION.md)
- [Security review](../EDUCATION_SECURITY.md)
- [Scientific provenance](../SCIENCE.md)

## Four journeys

| Lesson | What learners investigate |
| --- | --- |
| Our Solar System | The Sun, all eight planets, orbital order, relative distances and terrestrial versus giant planets |
| Inside the Sun | Fusion in the core, radiative and convective energy transport, and the distinction between observed outer layers and inferred interior structure |
| Inside the Planets | Rocky, gas-giant and ice-giant interiors, comparison with Earth, and evidence used to infer inaccessible regions |
| Beyond Our Solar System | Light-years, stellar classifications, catalog-backed nearby stars, confirmed exoplanets and limits on what detection tells us |

Lessons use the existing travel, interior and comparison controls. Questions give explanations, and the text alternative carries the scientific explanation when a learner cannot use the spatial interaction. Neither an account nor a student profile is required.

The source of truth for lesson wording, destinations and questions is `app/education.ts`. The candidate has 21 stages and 16 questions. Its scientific registry currently contains 514 claims and 130 sources; those are coverage counts, not independently verified fact counts. The [teacher guide](TEACHER_GUIDE.md) explains how to use the activities without treating the renderer's compressed scales as physical measurements.

## Before a classroom session

Run the application and complete the intended lesson on the actual devices and browser used in class. Select a suitable quality tier, check keyboard access and decide whether to use the visual interaction or its text alternative. Use the source disclosures to discuss both evidence and uncertainty. See the validation and limitations documents for the exact scope of checks performed on this candidate.
