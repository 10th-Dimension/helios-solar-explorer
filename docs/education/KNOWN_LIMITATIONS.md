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

The release candidate aims to improve keyboard, focus, screen-reader labels, reduced-motion behavior and text alternatives. It is not an independently certified WCAG 2.2 AA implementation. A 3D visual scene cannot carry all educational meaning for every learner; use the text alternative and source disclosures where needed. A teacher should check the actual devices and assistive technologies used in class.

Browser-local progress can be blocked, cleared or shared with the next user of the same browser profile. It is not an authenticated assessment record or a secure gradebook. Lesson feedback supports learning and retry, rather than a high-stakes exam.

## Performance and browser scope

The existing scene preloads geometry/textures and includes a large Three.js client bundle. Quality tiers help, but do not guarantee a frame rate. Dense labels can overlap. A short headed-browser check establishes only the exercised paths, not leak freedom, sustained GPU headroom or broad device support. Keep exact measurements and browser coverage in the candidate validation report rather than generalizing from build success.

Touch and pinch depend on the browser's support. Low-memory devices or missing WebGL may require the text alternative. Closing other tabs, choosing a lower quality tier and returning Home are reasonable recovery steps.

## Hosting, security and release state

No public demo URL is claimed by these documents. The Education candidate must not replace or alter the owner's existing hosted application without new approval. See [deployment instructions](DEPLOYMENT.md) for a separate staging copy and [security findings](../EDUCATION_SECURITY.md) before exposure to untrusted traffic.

The current security report is a dated dependency review, not a penetration test. A passing public-file guard or secret scanner cannot prove that all possible disclosures or vulnerabilities are absent. Host operators remain responsible for TLS, access policy, server updates, request limits and response headers.

Curriculum alignment, independent educator evaluation, broad assistive-technology testing and learning-outcome studies are future validation work. Do not describe this candidate as classroom-certified.
