# Science, snapshots and provenance

## Preserved source contracts

`worlds.ts` holds Solar System stories, measurements, interior regions, environments, Earth-relative comparisons, confidence and sources. `stellar.ts` and `nearbyCatalog.ts` hold stellar/substellar identity and astrometry. `exoplanets.ts` and `exoplanetExpansion.ts` distinguish confirmed planets, parameter confidence and mass provenance. These modules were retained from the completed application rather than rewritten for publication.

The five confidence states are measured, inferred, uncertain, unknown and illustrative. They are not interchangeable; a compelling rendering is not evidence for a measured atmosphere or surface.

## Catalog scope

The curated source contains 83 stellar/substellar records, 65 local render anchors and 64 external destination records. Multiple source rows can share a system; unresolved sources remain one anchor instead of invented separately measured components. There are five white-dwarf records and eleven brown-dwarf source entries. The distant procedural field has no catalog identities.

The 24 confirmed-planet records comprise Proxima b/d and 22 added rows across Barnard's Star, Epsilon Eridani, GJ 887, Ross 128, Teegarden's Star, GJ 876, GJ 273 and YZ Ceti. Tau Ceti f/g/h were returned with `pl_controv_flag=1` and are excluded from the confirmed population; Proxima c is excluded too. This reflects the included source snapshot, not a guarantee of today's status.

## Reproducibility

`data/simbad-snapshot.json` and `data/archive-snapshot.json` preserve the original response data, query metadata, timestamps and parameter references. The expanded query date is 2026-10-23 UTC; the earlier original records retain their dates. The runtime does not refresh these automatically. Run `npm run test:stellar` to compare integrated scientific values against the snapshots and assert counts, confidence, references, coordinate behavior and destination integrity.

Do not silently regenerate source data during install/build. A future refresh must record the new query and timestamp, retain literature attribution, validate additions/removals, review controversies and explain changed values. The private research generation scripts are not part of this public snapshot; do not claim a one-command re-query pipeline is included.

## Important distinctions

- Stellar scientific distance is consistently derived from SIMBAD parallax. NASA's composite GJ 273 host distance disagreed; it was not mixed into the stellar coordinate model.
- Epsilon Eridani b and GJ 876 archive mass fields have `Mass` provenance, not `Msini`. Added archive-calculated radii are inferred, not transit measurements.
- The fixed stellar display epoch is Julian 2026.81. Linear space motion uses tangent proper motion (mu-alpha*cos(delta)) and radial velocity when supplied. Missing motion is held; no acceleration, binary solution or uncertainty propagation is inferred.
- Some white-dwarf spectroscopic velocities include gravitational-redshift contributions. This approximation is not precision barycentric astrometry.
- Body poles use J2000 NAIF-derived orientation, while stellar positions have a fixed propagated epoch. Surface prime-meridian phases and planetary orbital phases are illustrative.
- 1080× visual spin preserves relative signed periods; this is not live attitude tracking.
- Interior regions are pedagogical, not literal measured concentric shells. Giants have no asserted solid landing surface; the Sun is plasma, not a rocky globe.
- Atmospheres, ring shadows, storm placement, aurora folds/emission and solar events are approximations. No live event feed is included. Earth intentionally has no external blue halo or artificial selection outline in the current presentation.

See [source credits and usage terms](../THIRD_PARTY_NOTICES.md) and [architecture](ARCHITECTURE.md). Preserve raw values and uncertainty instead of reconciling disagreements from memory.
