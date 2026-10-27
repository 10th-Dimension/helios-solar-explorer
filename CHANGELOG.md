# Changelog

## Current main — coordinated framework maintenance

- Update Vinext to 1.3.0 together with @vitejs/plugin-rsc 0.5.38; Vinext's App Router requires plugin-rsc 0.5.37 or newer.
- Override only Vinext's Satori dependency path to patched fflate 0.7.5, resolving GHSA-px8p-9vwx-vf98 without downgrading the framework. Remove the obsolete image-size override because Vinext 1.3.0 no longer depends on it.
- Group future Vinext and plugin-rsc Dependabot updates so the framework pair is tested together. Application features, scientific snapshots and the v1.1.0 release tag are unchanged.

## Current main — resizable lessons, retries and evidence layout repair

- Add a draggable, keyboard-accessible lesson divider with a local width preference and bounded scene/reader sizes.
- Add Retry question and Retake lesson questions, unlimited optional retries, continued progression after incorrect attempts and completion accuracy separate from participation.
- Add shared-browser teacher reset guidance and keep fresh-learner progress clearing confirmed.
- Restrict layer/environment row grid rules to direct children so nested scientific evidence stays in a readable document flow. Isolate badges and remove nested evidence scrolling in information drawers.
- Preserve scientific values, source confidence/provenance, four lessons,21stages,16questions and one renderer/canvas. The published v1.1.0 tag remains the earlier release snapshot; these changes are a subsequent main/Site update.

## v1.1.0 — Helios Education 1.0

- Public live Site: https://helios-solar-explorer.eager-ape-4538.chatgpt.site/ . Education 1.0 was first deployed with owner approval after PR #15; this release adds the learning workspace redesign.
- Replace the narrow lesson sidebar with a spacious two-column library and a wider reading workspace beside the existing scene.
- Keep navigation visible in a persistent footer, enlarge reading/quiz controls, remove nested source scrolling and explain disabled progression.
- Add View scene / Read lesson switching, including automatic scene reveal on small-screen target navigation.
- Close conflicting Catalog/Worlds overlays, reset only the lesson reading scroll on stage changes, and cancel pending confirmation with Escape before exiting Education.
- Retain all four lessons, 21 stages, 16 questions, written alternatives, source disclosures, local progress and existing scientific snapshots.
- Add the public live link, full lesson inventory, educator links and release verification notes. Independent classroom certification and broad device/assistive-technology acceptance remain outside this release's evidence.

## Education 1.0 release candidate — 1.1.0-rc.1

- Four optional guided journeys in the existing scene, with 21 stages, 16 knowledge checks, real target/layer/comparison gates and equivalent written alternatives.
- Versioned local progress, pause/resume, safe replacement/restart, completion feedback and deletion controls without accounts or student tracking.
- Central scientific claims/sources, separate confidence and verification states, transparent dates and compact evidence disclosures for facts, interiors, catalog data and lessons.
- Source audit retains known scalar/date/definition discrepancies and original raw snapshots rather than silently changing scientific data.
- Native modal focus behavior, hidden-panel inertness, form-key isolation, readable education styles and pause-motion/reduced-motion support.
- Patched the inherited image parser using a scoped override and updated compatible Zod; full audit currently reports zero findings. This is not a server security certification.
- Teacher/student/contributor guides, printable worksheet, source audit, staging guidance, launch drafts and release materials. Production hosting is untouched and no public Education demo has been published.

This records features added to Helios and changes to the public project. Earlier development milestones are summarized here because the public repository begins with the complete application snapshot rather than its original development history.

## Documentation clarification — 2026-10-23

- Explain that the complete application runs independently of ChatGPT Sites; no missing hosting files or private notes are needed.
- Clarify Catalog versus Solar System counts, destination types, prerelease status and the package version.
- Document safe loopback-only production preview, development-dependency requirements, keyboard focus and the absence of an automatic hosting pipeline.
- Explain proposed dependency updates versus the default branch, coordinated React updates and the limits of a green verification badge.
- Review local links, commands, feature counts, attribution boundaries and completed-versus-planned features. No application logic, scientific values or dependencies change in this documentation update.

## v1.0.0-source.1 — first public source release (2026-10-23)

- MIT license for original code/documentation, standalone build configuration, contributor/security guidance, source credits, roadmap and public-file/secret audit tooling.
- Includes the complete application: Solar System exploration, planetary interiors, nearby stars, confirmed exoplanets, auroras, persistent names and smooth wheel zoom. Only the author's deployment-specific settings and internal development notes are excluded; neither is needed to run or modify Helios.
- The release is marked as a prerelease, with known dependency findings documented in the audit report. The package version is `1.0.0`; the published source tag is `v1.0.0-source.1`.

## Home and smoother zoom — 2026-10-23

- Display Home [Our Sun], retaining Sol/The Sun aliases and unchanged internal identity.
- Ease bounded wheel slices through the existing loop, cancel obsolete tails and retain native touch/reduced-motion handling.
- Stop label-slot evaluation at the first nonoverlapping candidate. The measured layout CPU improvement is a microbenchmark, not a measured frame-rate gain.

## Persistent star names — 2026-10-23

- Replace four-desktop/two-mobile name caps with small clickable labels for every visible local anchor.
- Add deterministic offsets, leaders and stable astronomical anchors; off-screen/behind-camera culling remains.

## Earth aurora repair — 2026-10-22

- Replace diffuse green patches with interrupted folded altitude curtains, fine rays and a softer red upper tail.
- Add persistent AURORA toggle and polar-night view with restore behavior.
- Remove Earth's artificial outline and external blue halo. Preserve other worlds' atmospheres and physical rings.

## Cosmic expansion and realism — 2026-10-22

- Expand to 83 stellar/substellar records, 65 navigation anchors, 64 external destinations and 24 confirmed planets across nine hosts.
- Add white/brown-dwarf classifications, component policies, fixed-epoch linear motion and retained raw source responses.
- Correct mass versus minimum-mass provenance and inferred radii; exclude controversial Tau Ceti rows.
- Add J2000 body attitudes, signed spin, aligned ring planes and shared Solar/stellar-frame reconciliation.
- Add historical NASA day/night/cloud imagery, illumination-aware cities, class materials, procedural activity and quality tiers.
- Keep procedural solar active regions local to the Sun, rather than synchronizing unrelated catalog stars.

## Seamless exploration — 2026-08-24

- Explore/Catalog overlays, source-linked search and generic destination architecture.
- Sirius A/B companion inspection alongside the existing Proxima planetary system.
- Render-only floating origin, deterministic labels and explicit epoch policy.

## Local cosmic atlas and planetary control — 2026-08-23 to 2026-08-24

- Continuous Solar-to-stellar navigation, catalog-backed nearby directions and Proxima b/d arrival/inspection.
- Single-scene approach, orbit, drift/refocus, information-on-demand, HUD hiding and interactive 3D interiors.
- Preserve Sun/eight-planet stories, environments, comparisons, confidence and scientific/render separation from the original Solar System foundation.
