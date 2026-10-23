# Roadmap

This is a direction for continued work, not a release schedule. Items below are not implied to exist today.

## Next milestone: system detail and spatial fidelity

1. Extend the existing Sirius semimajor-axis/period reference and fixed illustrative layout into epoch-aware fitted binary orbits, with source references, uncertainty and honest missing-data fallbacks.
2. Improve host-aware planet illumination and add ring shadows onto planetary globes.
3. Profile the actual GPU/main-thread bottlenecks on target hardware before selecting optimizations. Add lifecycle-aware texture/geometry streaming as catalog size warrants it.
4. Explore observed space-weather playback with explicit observation times and source provenance, separate from procedural previews.
5. Expand automated interaction, reduced-motion, accessibility and long-session resource tests.

## Carefully scoped later expansion

- First-class major moons and additional nearby systems, with parent relationships and reviewed scientific records.
- Catalog virtualization and more capable crowded-field label placement without hiding discoverability or moving real anchors.
- Better uncertainty/missing-motion treatment and an explicitly controlled epoch model.
- More teaching tools that preserve continuous spatial navigation.

## Explicit non-goals for now

No complete galaxy census, precision spacecraft navigation, physically faithful interstellar propulsion, real-time ephemerides, speculative habitable-world claims or invented observed exoplanet surfaces. A larger catalog must not erase existing content or weaken provenance.

## Already available

Solar System stories/interiors and planetary controls; shared destination records; render-only floating origin; fixed-epoch linear proper motion; 83 stellar/substellar entries; 24 confirmed planets; body attitudes; historical Earth day/night/cloud maps; persistent auroral curtains; persistent star names; Home [Our Sun] naming; eased wheel zoom. See [the changelog](../CHANGELOG.md).
