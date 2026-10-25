# Education feature guide

## A companion to exploration

Open **EDUCATION** from the main interface. The lesson library explains the four journeys and their learning objectives. Starting a lesson opens a compact panel alongside the existing scene; it does not create another renderer or replace the universe.

There are 21 stages across four lessons: nine in Our Solar System and four each in Inside the Sun, Inside the Planets and Beyond Our Solar System. Sixteen questions give immediate explanations and allow a learner to retry. This is guided learning rather than a timed exam or competitive score system.

## Completing a stage

A stage contains a target, an instruction, a concise explanation, scientific evidence and, where appropriate, a knowledge check. Its scene button uses the existing travel/inspection controls. Interior stages target a particular modeled layer, and the planet-comparison stage opens the existing Earth comparison.

The stage records reaching its scene target. It can also be completed through **Read a nonvisual alternative** followed by **Use this alternative for this stage**. The alternative provides the relevant information in text; it is not an empty bypass. A stage with a question still requires a correct answer before **Next stage** becomes available. Wrong choices show explanatory feedback and can be changed.

Use **Previous** to revisit an earlier stage. On the final stage, **Complete lesson** records completion and summarizes the objectives. You can restart or choose another lesson.

## Pause, resume and recover

- **Pause** keeps the lesson at its current stage while allowing exploration.
- **Resume lesson** continues the saved lesson.
- **Lesson library** returns to the lesson list without deleting the current progress.
- **EXIT** or Escape pauses and closes Education. Normal world, interior, catalog, aurora and quality controls remain available.
- **HOME** or **SYSTEM** recovers the normal spatial frame; lesson progress does not depend on keeping the camera in one place.
- **Delete saved lesson progress** asks for confirmation before resetting the browser-local record.

The saved record contains lesson/stage IDs, selected answers, interaction/alternative completion and completed lesson IDs. It contains no student name, roster, date-based activity log or remote account. Stored content is versioned and validated when read. Blocked or unavailable storage is reported in the panel, and the current in-memory lesson remains usable.

## Evidence and confidence

Scientific evidence disclosures connect educational claims to centralized references. They show the individual claim's confidence, source and relevant dates/limitations. A shared story, cutaway or catalog panel may combine different confidence levels; a single “measured” badge must not be read as certifying every statement or pixel.

The raw astronomical snapshots remain preserved. Catalog retrieval, reference coordinate epoch, publication date and observation date have different meanings. The application does not refresh the astronomical data when a lesson starts.

## Accessible use

The questions use labeled radio controls, and answers have textual feedback. Lesson headings receive focus on meaningful stage changes. The written alternative carries the learning content without requiring visual interpretation or pointer targeting inside the canvas. Reduced-motion settings freeze the new solar material animation and shorten or bypass supported navigation motion.

These are implementation features, not a blanket accessibility certification. See [known limitations](KNOWN_LIMITATIONS.md) and the final validation report for exact keyboard, assistive-technology, viewport and motion checks.
