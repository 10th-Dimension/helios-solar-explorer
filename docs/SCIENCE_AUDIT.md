# Scientific evidence review for Education 1.0

Review date: **2026-10-24**. Baseline: public source `c208dcab8a5d04b806186c54ce7137a776fd0ddb`. This is an application and source review, not scientific peer review, an independent experiment, a full numeric remeasurement, a live catalog refresh, or classroom certification.

## What is implemented

`app/science.ts` centralizes reusable sources and stable claims. Claims retain confidence, verification status, units where numeric, source identifiers, review dates and limitations. `SourceInspector` exposes this evidence through a keyboard-operable native disclosure. A source's observation/publication/retrieval/check dates are separate, nullable fields. An unknown date is displayed as unrecorded; it is never replaced by the release date.

Current generated inventory (checked by importing the actual records): **514 claims and 130 sources**, covering nine Solar System bodies, 83 stellar/substellar entries, 65 local navigation anchors, and 24 included exoplanets around nine hosts. Registry size is a coverage count, not the number of independently verified facts.

Confidence and verification are separate:

- **Measured:** observation-constrained property. It still has uncertainty and a source epoch.
- **Inferred:** estimate or interpretation using observations and a model.
- **Uncertain:** evidence or interpretation is genuinely not decisive.
- **Unknown:** a missing value; retained as null, never changed to measured zero.
- **Illustrative:** visual geometry, scale, appearance or timing created to teach/navigate.

**Source-reviewed** means the cited source was inspected for the stated concept. **Snapshot-matched** means an application quantity was compared with the included historical response. **Review-needed** means a specific source reconciliation remains open. **Illustrative** is not a scientific measurement. These labels deliberately prevent a citation badge from implying the entire object is verified.

## Sources and important claims reviewed

The following authoritative pages were inspected on 2026-10-24. Their publication dates were not uniformly supplied or separately established, so null publication dates are intentional.

| Evidence | Review scope and application treatment |
| --- | --- |
| [NASA Solar System facts](https://science.nasa.gov/solar-system/facts/) | Eight planets, inner rocky worlds versus the gas/ice giants, gravity and organization. Educational claim `edu.solar-structure`; spacing, apparent size and phase stay illustrative. |
| [NASA Sun facts](https://science.nasa.gov/sun/facts/) | Core fusion, approximately 15 million °C core, radiation and convection regions, plasma rather than solid ground. `edu.sun-energy` and individual interior descriptions remain inferred. The external plasma mesh is explicitly false color and accelerated. |
| [NASA Earth facts](https://science.nasa.gov/earth/facts/) | Inner/outer core, mantle, crust and approximate 71% ocean coverage. Deep structure is constrained indirectly; the diagram's boundaries are illustrative. NASA's popular mantle wording is simplified; the retained application describes slowly deforming silicate rock, not a global liquid magma ocean. |
| [NASA Jupiter facts](https://science.nasa.gov/jupiter/facts/) and [Juno discoveries](https://science.nasa.gov/mission/juno/) | No conventional solid landing surface; conducting metallic hydrogen and a gravity-constrained dilute core interpretation. Interior descriptions are inferred, not direct images or samples. |
| [NASA Neptune facts](https://science.nasa.gov/neptune/facts/) and [Uranus facts](https://science.nasa.gov/uranus/facts/) | Ice giants have hot, compressed volatile-rich interiors and no accessible conventional surface. Exact phase, composition profile and boundaries remain model-dependent. Neptune's saturated display blue is not a calibrated true-color claim. |
| [NASA Mercury facts](https://science.nasa.gov/mercury/facts/) and [MESSENGER core report](https://www.nasa.gov/solar-system/messenger-provides-new-look-at-mercurys-surprising-core-and-landscape-curiosities/) | Core extent approximately 85% of radius is an inference using radar, gravity and magnetic constraints. Rocky mantle/crust descriptions reviewed. |
| [NASA Venus facts](https://science.nasa.gov/venus/facts/) | Broad iron-core/rocky-mantle/crust structure, radar surface mapping and dense atmosphere. Pressure/temperature reconciliation remains open; no silently refreshed values. |
| [NASA Mars facts](https://science.nasa.gov/mars/facts/) and [InSight interior report](https://www.nasa.gov/centers-and-facilities/jpl/nasas-insight-reveals-the-deep-interior-of-mars/) | Crust/mantle/core and seismic inference. Present subsurface brines are uncertain; the new evidence badge corrects the old fact's overly general inferred classification without overwriting the legacy raw record. |
| [NASA Saturn facts](https://science.nasa.gov/saturn/facts/) and [Cassini FAQ](https://science.nasa.gov/mission/cassini/faq/) | Hydrogen/helium fluid envelope, metallic hydrogen interpretation and primarily water-ice rings. A probable/diffuse core stays model-dependent. |
| [NASA cosmic distances](https://science.nasa.gov/universe/cosmic-distances/) and [stellar classification](https://science.nasa.gov/exoplanets/stars/) | Light-year is a distance, not time; spectra/classification inform stellar temperature/type. Screen glow/radius is illustrative. |
| [NASA detection methods](https://science.nasa.gov/exoplanets/how-we-find-and-characterize/), [Archive column definitions](https://exoplanetarchive.ipac.caltech.edu/docs/API_PS_columns.html) and [composite table construction](https://exoplanetarchive.ipac.caltech.edu/docs/pscp_about.html) | RV wobble/transit dimming are indirect evidence. PSCompPars can combine references and calculate missing radii. Minimum mass is not always true mass, and confirmation does not establish a surface photograph. |
| [SIMBAD Proxima record](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Proxima%20Centauri) | The record page was reachable, but that access is **not** a new complete verification of the legacy baseline coordinates. Baseline astrometry remains review-needed. Expanded source quantities are snapshot-matched by existing data tests. |
| [JPL planetary physical parameters](https://ssd.jpl.nasa.gov/planets/phys_par.html) | Rounded mean radii (Venus through Neptune), Earth-relative masses (all eight planets), and equatorial gravitational acceleration (Mercury, Venus, Mars, Jupiter, Saturn, Neptune) match the preserved values at their stated precision. These individual claims are source-reviewed. Mean radius is distinct from equatorial radius; gravity is a derived quantity. Mercury's radius and Earth/Uranus gravity remain review-needed. |
| [NASA planetary fact sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) | Table identifies its last update as 2025-03-18; this is not a 2026 moon census. Its effective gravity includes rotation, unlike the JPL equatorial gravitational-acceleration column. This explains why combining tables without definitions can introduce apparent contradictions. |

The original scientific source modules and raw responses were preserved. No legacy numerical value was changed based on memory, a general web snippet, or a conflicting rounded overview.

## Historical snapshots and reproducibility

Canonical raw files:

| File | SHA-256 |
| --- | --- |
| `data/simbad-snapshot.json` | `7b6567631d33266c873a0e73b717869f7147e52793ea19de74d2af780fab52a3` |
| `data/archive-snapshot.json` | `06fd71130655dd88d9bc6e53b8c88b531ca262e68338e054eb5b3c6b251c7d81` |

Both raw response wrappers record retrieval at **2026-10-23T02:04:16.928Z**. Their query text and original parameter bibliography remain intact. Module summary constants record an earlier **02:01:55.023Z** acquisition-stage timestamp. These timestamps are not observation dates or release dates; the discrepancy is recorded, not silently rewritten. SourceInspector shows only the shared retrieval date, not a fabricated single observation time.

The expanded archive response has 22 included noncontroversial planets and excludes the three controversial Tau Ceti rows. Original Proxima b/d records were retained from their earlier 2026-08-23 provenance. The expansion response does not contain those two original rows. The raw SIMBAD query contains candidates and bibliography; curation preserves original baseline objects and selects additional physical/unresolved source records rather than presenting all candidates as independent new stars.

## Explicit unresolved gaps and significance

| Gap | Status and significance |
| --- | --- |
| Remaining legacy planetary scalar fields lack complete parameter-level reconciliation | **Review needed.** Individually identified JPL radius/mass/gravity matches are source-reviewed; this does not verify every pressure, day, temperature or moon value. Confirm definitions, rounding and epochs before future corrections. The original parameter responses for these legacy world summaries were not preserved. |
| Giant-planet moon totals | **Review needed and time-sensitive.** Stored Uranus count is 29 while the reviewed NASA facts page says 28. Stored Jupiter/Saturn totals also need dated census evidence. The audit does not select whichever current-looking number is larger. |
| Sun's Earth-radius comparison | **Review needed.** 696,340 km / 6,371 km is about 109.298, while the legacy ratio is 109.2. This small mismatch is retained explicitly. Unit tests allow that documented Sun approximation while requiring closer agreement for planets; they still reject unit-scale errors. |
| Venus rounded pressure/temperature | **Review needed.** Stored approximately 92×/465 °C differs slightly from the reviewed overview's approximately 93×/467 °C. Definitions/reference conditions and rounding must be reconciled, not guessed. |
| Earth's approximately 15 °C mean temperature | **Review needed.** It is a historical/rounded summary with no averaging window, not a statement of current global climate. |
| Radius and gravity conventions | **Review needed where marked.** Mercury's stored 2,440 km is near several rounded radius definitions; JPL mean radius is 2,439.4 km. Earth stores 9.81 m/s² versus JPL equatorial gravitational acceleration 9.80. Uranus stores 8.69 versus JPL 8.87; NASA's effective-gravity table rounds to 8.7. These are retained with explicit per-field review status; mixed definitions must not be treated as an independently verified consistent set. |
| Original Proxima rows, including d's discovery-year field | **Review needed.** They are not cross-checked by the expanded raw response. Existing tests preserve the original values but preservation is not scientific verification. A separately preserved original/archive query is required before correcting or promoting them to snapshot-matched. |
| Baseline stellar astrometry | **Review needed.** Original source coordinates are not all duplicated exactly in the expanded snapshot. Expansion rows are checked against their response. |
| Stellar distance and motion uncertainty | **Bounded approximation.** Distances use reciprocal parallax. Fixed Julian epoch 2026.81 uses linear motion, holds missing velocity components, and ignores acceleration and full uncertainty propagation. No live ephemeris claim. |
| Deep interiors and illustrated boundaries | **Model dependent.** Presence/composition constraints do not establish the mesh radii or a sharply measured layer boundary. Each cutaway includes a separate illustrative geometry claim. |
| Current planet confirmation/census | **Not independently refreshed.** Snapshot status is preserved; no automatic network updates or new destinations were introduced. |

These gaps prevent a blanket “scientifically verified” or “classroom certified” claim. They do not prevent teaching well-sourced concepts while making uncertainty visible.

## Automated verification

Run `npm run test:science` (also included in `npm test`), or directly:

```bash
node --experimental-strip-types scripts/verify-science.mjs
```

The suite validates all claim/source graph relationships, stable IDs, confidence/status enums, source URL/date metadata, null/unknown behavior and numeric units. Adversarial cases verify rejection of missing citations, dangling sources, duplicate IDs, invented confidence/status values, zero disguised as unknown, missing known values, non-finite numeric quantities, unsafe source schemes and future review dates.

It also validates world radius-unit consistency within documented legacy tolerances, one fact mapping per index, separate layer geometry confidence, preserved unknown core boundaries, source record identifiers, planet host existence through existing tests, noncontroversial expansion confirmation, raw mass/radius/orbit values, calculated radius provenance, minimum-versus-true mass contracts, missing velocities, catalog/destination relationships and both immutable snapshot hashes.

The existing `test:stellar` suite remains authoritative for expanded astrometric row matching, analytic motion transforms, original baseline values, system relationships, uncertainty handling and destination invariants. Neither suite proves that remote links are perpetually live or that all scientific claims are correct. Browser/visual/source-disclosure checks are reported separately by the release validation summary.

