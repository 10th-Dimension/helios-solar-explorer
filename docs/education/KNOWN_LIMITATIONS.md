# Education release-candidate limitations

These are boundaries of the software and evidence, not features to hide from learners.

## Science and visualization

- Catalogs are curated historical snapshots, not a complete current census or a live astronomical service.
- Stellar astrometry uses a fixed display epoch and a linear propagation approximation. Missing motion remains explicitly limited; binary accelerations and propagated uncertainties are not solved.
- Screen distances, body sizes, travel time, rotation and orbital phases are transformed or accelerated. They must not be measured as literal astronomy.
- Cutaways are pedagogical models. Giant-planet interior boundaries and composition can remain uncertain, and giant planets do not have conventional solid landing surfaces.
- Exoplanet confirmation does not establish an observed surface, atmosphere, oceans or life. Some displayed radii are inferred and radial-velocity values may be minimum masses.
- The orange Sun is an illustrative ultraviolet false-color presentation. Its turbulent texture, event locations and compressed eruption schedule are procedural, not a current NASA observation or forecast.
- Earth imagery is historical. Clouds, auroras and other weather/activity are illustrative rather than live.
- Per-claim source status distinguishes reviewed explanatory evidence from preserved snapshot provenance and unresolved claims. Opening a source does not establish that every sentence in the original story has been independently verified.

## Accessibility and classroom use

Education 1.0 implements native modal focus behavior, inert hidden panels, labeled quiz controls, focus indicators and text alternatives. It is not an independently certified WCAG 2.2 AA implementation. A 3D visual scene cannot carry all educational meaning for every learner; use the text alternative and source disclosures where needed. A teacher should check the actual devices and assistive technologies used in class.

The manual **PAUSE MOTION** control was exercised in a production-build browser: the visual clock remained at 26.484 seconds across a stellar-to-planet-to-Home journey while manual travel remained active. This is one bounded observed path, not a claim that every animation or assistive-technology combination has been verified. OS media emulation was not exposed by the available browser capabilities, so visual acceptance of an operating-system reduced-motion preference is **NOT VERIFIED**. The source implements the preference; that is a different evidence level.

Browser-local progress can be blocked, cleared or shared with the next user of the same browser profile. It is not an authenticated assessment record or a secure gradebook. Lesson feedback supports learning and retry, rather than a high-stakes exam.

## Performance and browser scope

The existing scene preloads geometry/textures and includes a large Three.js client bundle. Quality tiers help, but do not guarantee a frame rate. Dense labels can overlap. A short headed-browser check establishes only the exercised paths, not leak freedom, sustained GPU headroom or broad device support. In bounded desktop ULTRA samples, the overview recorded about 1.54 ms mean render-loop CPU time over 60 frames and a stellar frame about 1.37 ms over 60 frames. Those counters do not measure GPU duration, end-to-end input latency or a sustained frame rate. Resources changed from 78 geometries/18 textures initially to 109/20 after first uploads; three later Earth/overview cycles at HIGH held 150 geometries/23 textures with one canvas. Neither observation establishes leak freedom. The [candidate validation report](../EDUCATION_VALIDATION.md) records the different scene/quality samples separately rather than treating them as an A/B comparison.

The Solar System lesson and all nine written alternatives completed at an emulated 390×844 viewport with no horizontal page overflow. The mobile panel scrolled to questions and source details, and reopening a lazily mounted source disclosure populated its content. AUTO selected BALANCED with 3,500 decorative stars. This is a desktop-browser viewport test, not a physical phone, touch/pinch or screen-reader test. Closed source disclosures were also checked before and after lazy mounting; the DOM reduction is not a measured frame-rate improvement.

Touch and pinch depend on the browser's support. Low-memory devices or missing WebGL may require the text alternative. Closing other tabs, choosing a lower quality tier and returning Home are reasonable recovery steps.

## Hosting, security and release state

The public Helios Site includes Education 1.0 following explicit owner publication approval. Future deployments still require the owner’s authorized scope; independent staging remains separate. See [deployment instructions](DEPLOYMENT.md) for a separate staging copy and [security findings](../EDUCATION_SECURITY.md) before exposure to untrusted traffic.

The current security report is a dated dependency review, not a penetration test. A passing public-file guard or secret scanner cannot prove that all possible disclosures or vulnerabilities are absent. Host operators remain responsible for TLS, access policy, server updates, request limits and response headers.

The local production-build server returned successful responses for the root page, the PNG share card and NASA day JPEG, and returned 404 for a missing route. This verifies those exercised response paths, not internet deployment, all security headers or cross-browser support.

Curriculum alignment, independent educator evaluation, broad assistive-technology testing and learning-outcome studies are future validation work. Do not describe this candidate as classroom-certified.
