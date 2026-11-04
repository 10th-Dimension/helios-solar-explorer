# Sourced exploration: implementation and verification

This records the bounded roadmap implementation and interaction repairs reviewed in November 2026. It is not a claim that every roadmap ambition, control instance or hardware configuration is complete. Package version remains 1.1.2 until a separate release is made.

## Implemented scope and sources

### Major moons and additional nearby systems

`app/majorMoons.ts` contains rounded agency facts for the [Moon](https://science.nasa.gov/moon/facts/), [Europa](https://science.nasa.gov/jupiter/jupiter-moons/europa/europa-facts/), [Titan](https://science.nasa.gov/saturn/moons/titan/facts/) and [Enceladus](https://science.nasa.gov/saturn/moons/enceladus/), with retrieval dates. Radius comparisons are calculated from those rounded values. Parent navigation reuses existing Earth/Jupiter/Saturn information and travel; these are not four new moon globes or live moon ephemerides.

`data/nearby-hosts-roadmap.json` preserves a reproducible NASA Exoplanet Archive query, captured rows, nullable error fields and parameter literature references for TRAPPIST-1 and GJ 1132. See the [archive column definitions](https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html). Controversial rows are not presented as confirmed. These additions are reference-only until suitable coordinate epoch/frame metadata supports spatial integration; the existing 83 stellar/substellar records and 24 planets remain the navigable catalog.

### Catalog, labels and epochs

`catalogWindow.ts` paginates 24 results. `catalogEvidence.ts` derives spectral groups, using the host star for planets. Catalog selection is page-local and paging resets with filters. One native scroll surface preserves access to results, evidence and travel actions; a one-page result set has an honest summary rather than misleading disabled pagination.

`stellarLabels.ts` uses deterministic spatial-bin neighbor lookup without changing astronomical anchors or withholding discoverability. Crowded finite views can still overlap. Synthetic tests cover 10,003 paginated records and 1,000 label candidates, not a measured hardware FPS improvement or complete virtualization.

The controlled Julian epoch is 1900–2100, default 2026.81. ICRS J2000 directions propagate with component-wise linear motion; radial velocity is used only where cataloged. Unknown motion and missing covariance remain explicit. Epoch changes return Home and recompute travel distances to avoid stale targets. This is not a nonlinear ephemeris or a UTC observation timestamp.

### Teaching and Sirius

The Science workbench adds a temporary prediction/explanation note, radius comparison and source inspection. Notes last only while the workbench is mounted; no student account, grading or transmission is added. Existing four lessons, 21 stages and 16 questions are preserved.

`siriusOrbit.ts` implements the relative B–A visual-orbit fit in [Bond et al. (2017), Tables 2/4/5](https://arxiv.org/html/1703.10625v1). The seven elements include period, angular semimajor axis, eccentricity, inclination, node, periastron angle and epoch. Julian-year labels convert to Besselian years using the conventional [ERFA epoch definition](https://raw.githubusercontent.com/liberfa/erfa/master/src/epb.c); this is independently implemented mathematics, not a UTC-to-TT conversion.

The displayed projection is J2000 north/east, relative secondary to primary. Published scalar errors are retained, but no covariance envelope, measured line-of-sight depth, absolute barycentric orbit or full 3D ephemeris is invented. Existing unfitted companions keep their schematic-layout disclosure.

### Illumination, rings and observed weather

Planet day/night shading uses its host direction. Saturn's displayed annuli/gaps attenuate intersecting light rays onto the globe, invariant to render-origin translation. Albedo, ring opacity, sizes and phases remain illustrative; this is not a fit to measured visible-light optical depth. [Cassini ring observations](https://pds-rings.seti.org/cassini/) are observational references, not a claim that the rendered view is an image.

`data/observed-weather.json` identifies four NASA/SDO AIA 304 Å visualization frames from 10 May 2024: 18:00:05, 18:30:05, 19:00:05 and 19:30:05 UTC. Each has a source ID, requested/observed time, metadata/header/render URLs and SHA-256. Frames are bundled under `public/observations/`; playback makes no runtime data request. See [Helioviewer API documentation](https://api.helioviewer.org/docs/v2/api/api_groups/official_clients.html).

Thirty-minute sampling is this capture's choice, not instrument cadence or continuous coverage. Raw QUALITY values remain uninterpreted. These are false-color visualization products, not calibrated intensity analysis, a live event feed, observed 3D aurora or solar-wind forecasting. Play/pause, bounds, replay, frame scrub, missing-image and visibility/reduced-motion behavior are covered separately from the procedural solar/auroral previews.

### Performance and streaming

`gpuTiming.ts` polls nonblocking WebGL2 timing queries only when available, discards disjoint results and disposes queries. The Performance panel records at most 300 local samples; unavailable measurements remain unavailable, not zero. Counters are not VRAM bytes.

The observed hardware renderer was Intel Arc through ANGLE/Direct3D11. An available RTX 4050 was not measured; those results cannot be transferred to it. Short overview/resource recordings and repeated navigation are bounded checks, not a completed GPU/main-thread bottleneck profile or long-session leak proof. No lifecycle streaming or speculative performance optimization is claimed.

## Interaction repairs

- Catalog scrolling no longer collapses results into an implicit grid row. Keyboard scrolling/editing remains native; Escape works inside Catalog controls and restores focus without leaking keys into the scene.
- Hidden HUD and overlay controls leave keyboard/accessibility navigation through `inert` and truthful hidden state.
- Destination Close/Info controls hide/reopen information while preserving the approached body. Back to System and Home remain distinct. A clipped scene and bounded scrolling dock retain short-screen action access.
- Planet spectrum filtering uses host class; missing companion classes no longer disappear from those filters.
- WebGL initialization failure cancels pending stellar/approach and lesson requests, and guards all central entry/completion callbacks. It does not simulate arrival with a timer.
- No-3D Education shows the complete written alternative, keeps its reading/footer visible and requires explicit alternative participation plus the normal answer gate. Catalog evidence and world information remain accessible; unavailable interstellar actions are disabled.
- Existing merged #29/#30 dismissal, modal, blur-key and stale-focus repairs are retained; they are not newly invented or reattributed here.

## What the saved checks establish

| Evidence level | Recorded coverage | Does not establish |
| --- | --- | --- |
| Production data/controller suites | 13 suites; 107 catalog targets, 210 filters, 106 destination variants, 514 claim rows, safe reference contracts, lifecycle/math/source checks | Every target or disclosure exercised in a real browser |
| Isolated rendered components | All 21 lesson stages and question options; retry/resume/reset fixtures; 82 motion choices; four moons/16 comparisons; weather/widget behavior | Actual scene arrivals in lesson fixtures; physical devices; real-user reset data |
| Real rendered review workflows | 64 system arrivals; 24 planet approach/close/reopen/back cycles; all nine Solar worlds and 32 interior layers; representative other controls and responsive checks | Every Home/Escape/label/comparison/filter variant or every 3D configuration |
| Cloud VM follow-up | Successful repaired no-3D fallback retest | A GPU-rendering pass when that VM has no WebGL |
| Build/tool checks | Typecheck, lint and production builds; clean strict dependency install | Runtime correctness, zero vulnerabilities or full scientific/accessibility certification |

The source inventory contains 129 control sites, including dynamic families: 84 button sites, 21 link sites and other inputs/disclosures. Two legacy SystemMap button implementations have no opening path. The inventory is enumeration, not 129 independent live passes. The earlier ledger classified 60 sites with mixed live/representative/handler evidence, 46 isolated, 21 partial link contracts and two unreachable. No precise total of all possible generated state/device instances was established.

All 64 arrival screenshots were saved; not every capture was individually visually inspected. Generated source links were contract-checked, not all freshly opened. Some evidence spans successive review versions rather than one exhaustive final-build run. Public standalone integration and its exact commit checks are recorded in the pull request.

### Remaining acceptance work

- Complete real-3D/reset/device combinations and physical touch/trackpad tests.
- Complete screen-reader/assistive-technology and OS reduced-motion visual acceptance.
- Run an extended resource soak and intended-hardware bottleneck profile.
- Revalidate external reference destinations as needed; no claim every remote page was checked.
- Keep browser-suite availability distinct from executed results. The existing Verify CI runs deterministic checks, not the full browser matrix.

No dependency findings are silently fixed or hidden: the integration's clean install reports 16 moderate findings. See the current audit output and [maintenance review](MAINTENANCE_REVIEW.md); CI's high/critical gate is not a zero-finding guarantee.

## Reproduce

Use [development commands](DEVELOPMENT.md), [browser testing](BROWSER_TESTING.md), and the scripts in `package.json`. Preserve original raw snapshots and their hashes, source references and uncertainty policy when extending this work. A GitHub branch/PR and a hosted publication are separate operations; neither implies merge or deployment of the other.
