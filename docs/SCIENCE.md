# Science, snapshots and provenance

## Preserved source contracts

`app/worlds.ts` holds Solar System stories, measurements, interior regions, environments, Earth-relative comparisons, confidence and sources. `app/stellar.ts` and `app/nearbyCatalog.ts` hold stellar/substellar identity and astrometry. `app/exoplanets.ts` and `app/exoplanetExpansion.ts` distinguish confirmed planets, parameter confidence and mass provenance. These application modules are included in full and do not depend on the author's hosting setup.

The five confidence states are measured, inferred, uncertain, unknown and illustrative. They are not interchangeable; a compelling rendering is not evidence for a measured atmosphere or surface.

## Catalog scope

The curated source contains 83 stellar/substellar entries including our Sun, 65 local navigation anchors and 64 external destination records. The destination records comprise nine planetary systems, one binary-system layout, 16 other multiple-system layouts and 38 single-object frames. A destination is not necessarily a detailed planetary system. Multiple source rows can share a system; unresolved sources remain one anchor instead of invented separately measured components. There are five white-dwarf records and eleven brown-dwarf source entries. The distant procedural field has no catalog identities.

The 24 confirmed-planet records comprise Proxima b/d and 22 added rows across Barnard's Star, Epsilon Eridani, GJ 887, Ross 128, Teegarden's Star, GJ 876, GJ 273 and YZ Ceti. Tau Ceti f/g/h were returned with `pl_controv_flag=1` and are excluded from the confirmed population; Proxima c is excluded too. This reflects the included source snapshot, not a guarantee of today's status.

## Reproducibility

`data/simbad-snapshot.json` and `data/archive-snapshot.json` preserve the original response data, query metadata, timestamps and parameter references. The expanded query date is 2026-10-23 UTC; the earlier original records retain their dates. The runtime does not refresh these automatically. Run `npm run test:stellar` to compare integrated scientific values against the snapshots and assert counts, confidence, references, coordinate behavior and destination integrity.

The application and its tests use the included snapshots; running Helios does not require querying a provider. An automatic catalog-refresh command is not currently provided. For a future refresh, use the query metadata stored in the snapshots, record the new response and retrieval timestamp, retain literature attribution, validate additions/removals, review controversies and explain changed values. Do not make data refreshes a silent side effect of installation or build.

## Important distinctions

- Stellar scientific distance is consistently derived from SIMBAD parallax. NASA's composite GJ 273 host distance disagreed; it was not mixed into the stellar coordinate model.
- Epsilon Eridani b and GJ 876 archive mass fields have `Mass` provenance, not `Msini`. Added archive-calculated radii are inferred, not transit measurements.
- The fixed stellar display epoch is Julian 2026.81. Linear space motion uses tangent proper motion (mu-alpha*cos(delta)) and radial velocity when supplied. Missing motion is held; no acceleration, binary solution or uncertainty propagation is inferred.
- Some white-dwarf spectroscopic velocities include gravitational-redshift contributions. This approximation is not precision barycentric astrometry.
- Body poles use J2000 NAIF-derived orientation, while stellar positions have a fixed propagated epoch. Surface prime-meridian phases and planetary orbital phases are illustrative.
- 1080× visual spin preserves relative signed periods; this is not live attitude tracking.
- Interior regions are pedagogical, not literal measured concentric shells. Giants have no asserted solid landing surface; the Sun is plasma, not a rocky globe.
- Atmospheres, ring shadows, storm placement, aurora folds/emission and solar events are approximations. No live event feed is included. Earth intentionally has no external blue halo or artificial selection outline in the current presentation.

### Home photosphere rendering

Home uses one ultraviolet false-color presentation throughout the scene; the former visible-light mode and toggle have been removed following visual feedback. Animated three-dimensional domain warping makes the orange plasma network visibly churn. Flow along strands is accelerated, and a deterministic pseudorandom schedule selects one small, three-strand eruption group every seven seconds, with quiet gaps and a rise, release and fade. This is accelerated educational activity, not observed event timing. Other catalog stars retain their materials. Interior viewing hides the external loops.

References inspected for the visual treatment: NASA SVS [Hinode granulation stills and movie](https://svs.gsfc.nasa.gov/3412/) and [SDO 304 Å eruption and loop stills/movie, 18 June 2015](https://svs.gsfc.nasa.gov/4323/). References guide morphology and motion; no imagery is wrapped onto a globe and no NASA media is redistributed. Geometry, cell scale, exposure, color mapping and time are illustrative, not measured solar observations or live space weather. Granulation is derivative-filtered at distance; reduced-motion freezes the new material animations. A warm display filter is not a claim about the Sun's naked-eye color. The loop geometry is an illustration, not a magnetic-field solution or exact AIA passband synthesis.

NASA distinguishes the visible photosphere and sunspots from the hotter structures seen in [false-color ultraviolet images](https://stereo-ssc.nascom.nasa.gov/classroom/EUVsun.shtml); its [Sun overview](https://science.nasa.gov/sun/facts/) describes prominences, spicules and the much fainter corona. The atlas's existing event/corona illustration remains an approximation, not a spectral simulation.

See [source credits and usage terms](../THIRD_PARTY_NOTICES.md) and [architecture](ARCHITECTURE.md). Preserve raw values and uncertainty instead of reconciling disagreements from memory.
