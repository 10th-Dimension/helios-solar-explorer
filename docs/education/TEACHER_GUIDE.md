# Teacher guide

## Purpose and level

Helios is designed for curious beginners and secondary-school discussions about astronomical structure, evidence and uncertainty. It has not been mapped to a specific curriculum standard or independently evaluated for learning effectiveness. Use it as a guided exploration tool alongside your course materials, not as the sole scientific authority.

The 3D experience and the text alternative teach the same concepts. Students can work individually, in pairs at one device, or with a projected instructor-led scene. No account, student name or class roster is needed.

## Prepare a session

1. Open the intended build on the actual classroom devices. Complete your chosen lesson before teaching it.
2. Confirm the source disclosures open, navigation reaches the required objects and the text alternative is usable.
3. Select a quality level that keeps interaction comfortable. ULTRA is optional; it is not required to understand a lesson.
4. Test keyboard navigation, display size and reduced-motion needs. Avoid requiring a learner to manipulate the canvas to demonstrate understanding.
5. Explain the visualization's scale and time transformations before students infer distances from the screen.
6. On shared devices, restart the lesson. Browser-local saved progress belongs to that browser session, not an identified student.

There is no claimed universal lesson duration. Allow time for reading, exploration and discussion; pace according to the class and device. The activities below can be used independently.

## Lesson A: Our Solar System

Learning objectives: identify the Sun and eight planets in order; distinguish terrestrial and giant planets; explain that gravity governs orbital motion; use stated distances rather than screen spacing.

Activity: assign each pair two planets to inspect. Ask them to record one shared property and one difference, including the confidence of each claim. Reassemble the orbital order as a class. Discuss why a scientifically useful atlas might compress distances and enlarge bodies.

Discussion prompts:

- Why would a true common scale for both distances and sizes be difficult to use on a laptop?
- What separates a rocky surface from the outer layers of a giant planet?
- Does a longer animation path prove a longer measured orbit?

Expected reasoning: the terrestrial planets are Mercury, Venus, Earth and Mars; Jupiter and Saturn are gas giants, and Uranus and Neptune are ice giants. The latter labels describe composition and structure, not conventional solid landing surfaces. Scientific quantities and their references carry the numerical meaning.

## Lesson B: Inside the Sun

Learning objectives: distinguish fusion from combustion; trace energy transport through the core, radiative and convective regions; explain plasma; separate photospheric observations from inference about the interior.

Activity: open the Sun's interior and visit its four regions in order. Students write a sentence about how energy is produced or transported in each. Ask them to open the evidence for a modeled interior claim and explain why a cutaway is not a photograph.

Discussion prompts:

- What evidence can constrain a region we cannot directly visit?
- How is the movement of plasma in a convective region different from radiative energy transport?
- Why is an orange ultraviolet visualization labeled false color?

Expected reasoning: fusion in the core releases energy; the radiative region mainly transports energy by radiation and the convective region by moving plasma. Helioseismology and solar models constrain the interior. Outer-layer emission is observed at particular wavelengths; the rendered interior boundaries and accelerated motion are illustrations.

## Lesson C: Inside the Planets

Learning objectives: compare Earth, Jupiter and Neptune as examples of different planetary structures; identify evidence for inaccessible interiors; understand that giant-planet regions and boundaries are model dependent.

Activity: compare an Earth mantle region, Jupiter's metallic-hydrogen region and Neptune's deep interior. Record the source, confidence and an explicit limitation for each. Use the Earth comparison tool, but discuss the numerical ratio rather than inferring size from camera framing.

Discussion prompts:

- How do seismic observations help with Earth's interior?
- What can gravity and magnetic-field observations tell us about giant planets, and what do they leave uncertain?
- Why is “ice giant” not a claim that Neptune has an exposed ice surface?

Expected reasoning: Earth has seismic constraints; deep giant-planet structure is inferred through models constrained by observations. “Metallic hydrogen” names a predicted high-pressure state, not a metal shell that spacecraft photographed. Neptune's deep composition and boundaries remain uncertain.

## Lesson D: Beyond Our Solar System

Learning objectives: define a light-year as distance; understand stellar classification at an introductory level; distinguish a star, a planetary system and an exoplanet; explain why detection is not a photographed surface.

Activity: travel to Proxima Centauri and an included confirmed planet. Inspect the catalog position and the planet's mass/radius evidence. Ask students to distinguish minimum mass, measured mass and inferred radius where the displayed record makes those distinctions.

Discussion prompts:

- Why is a light-year not a unit of time in a distance field?
- What does radial-velocity detection measure about a star's motion?
- Does “confirmed” establish oceans, an atmosphere or life?

Expected reasoning: light-year is a distance. Stellar classifications describe observed properties such as spectral appearance and temperature-related class, not simply size. Radial velocity detects line-of-sight stellar motion consistent with an orbiting companion. A confirmed object can still have unknown surface and atmosphere; inferred radius is not a transit measurement.

## Assessment and answer explanations

The interactive questions include immediate explanations, and wrong answers can be retried. Use the explanation and the source, rather than the score alone, to assess reasoning. The following answer key was checked against the candidate's `app/education.ts` definitions. There are 21 stages and 16 questions. Some exploration stages have no quiz, but still require the scene interaction or the written alternative before continuing.

| Lesson / question identifier | Correct response and teaching point |
| --- | --- |
| Our Solar System · `system-gravity` | The Sun's gravity attracts planets while they move through space. Orbit combines attraction and motion. |
| `system-scale` | Read the AU or light-year value and its provenance; do not measure screen separation. |
| `system-giants` | Jupiter's visible bands are clouds above a deep fluid planet. |
| `system-families` | Four terrestrial planets, two gas giants and two ice giants. |
| Inside the Sun · `sun-fusion` | Hydrogen fusion in the core powers the Sun, rather than chemical flames. |
| `sun-radiation` | Radiation interacting with matter is the main energy-transport process in the radiative zone. |
| `sun-convection` | Motion of hotter and cooler plasma transports energy by convection. |
| `sun-evidence` | Outer observations and constrained interior models support different kinds of claims. |
| Inside the Planets · `planets-mantle` | Seismic waves and physical models help investigate most of Earth's mantle. |
| `planets-metallic` | Metallic hydrogen means electrically conducting hydrogen fluid under high pressure. |
| `planets-ice` | Neptune's deep interior is modeled as hot, high-pressure material with uncertainties. |
| `planets-comparison` | Radius compares size independently of display scaling; it does not directly give mass or surface state. |
| Beyond Our Solar System · `beyond-light-year` | A light-year is a distance unit. |
| `beyond-confirmed` | Detection can establish a planet while its surface remains unknown. |
| `beyond-inference` | An inferred radius is a model-dependent estimate with a source and limitations. |
| `beyond-summary` | Inspect the source, confidence and limitations of each claim. |

The printable sheet asks students to justify their answer, name evidence and identify a limitation. A scientifically sound response may explicitly state that a property is unknown.

The library distinguishes **Resume** for an unfinished current attempt from **Review completion** for a completed current attempt. **PAUSE MOTION** can keep the visual clock still during discussion without preventing manual travel. Browser checks completed the Sun, Planets and Beyond lessons through real scene interactions, and the nine-stage Solar System lesson through its written alternatives at a 390×844 viewport. The corrected host-return action was rechecked. Consult the [candidate validation report](../EDUCATION_VALIDATION.md) for exact paths and remaining coverage rather than assuming every classroom setup was tested.

## Accessibility and safeguarding

- Offer the text alternative and keyboard path equally, without requiring disclosure of a disability.
- Check contrast and readability on the actual projector. Do not rely on color alone to convey confidence.
- Use reduced-motion settings and lower quality when needed.
- Helios has no teacher roster, remote gradebook or student analytics. Do not enter personal student information into issue reports.
- Browser-local progress is not a secure assessment record, and shared profiles should not be treated as individual student accounts.

## Limits and troubleshooting

See [known limitations](KNOWN_LIMITATIONS.md) and [student troubleshooting](STUDENT_GUIDE.md#if-something-goes-wrong). If WebGL is unavailable, use the text alternative and source records. Local storage can be unavailable or cleared. Do not claim a full accessibility or cross-device performance pass from a short smoke test.
