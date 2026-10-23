# Architecture and invariants

## Persistent spatial ownership

`SolarSystemScene.tsx` owns one Three.js renderer, scene, perspective camera, OrbitControls instance, RAF loop and canvas. Solar, stellar and destination groups share this lifecycle. Mode changes and information panels are React state/overlays, not new universes. Cleanup removes listeners/observers and disposes GPU resources.

`page.tsx` owns selection, arrival, travel requests, Catalog, information and interior state. Object selection does not automatically open a large information drawer. The scene communicates compact state, not per-frame React renders.

## Scientific versus render space

`spatial.ts` separates actual AU values from render radii/orbits. `stellar.ts` preserves ICRS J2000 catalog astrometry, derives fixed-epoch linear-motion Cartesian positions, then applies a separate Y-up compressed render transform. `cosmicCoordinates.ts` shifts only disposable render coordinates, camera and target during floating-origin rebasing. Scientific records never move with the origin.

Solar bodies use J2000 ecliptic pole frames. The Solar parent rotates by the J2000 obliquity to meet the shared stellar ICRS frame. Do not apply obliquity twice. Hierarchy: orbit position → pole frame → spinning surface. Rings/clouds/auroras inherit the pole; pedagogical interiors and selection annotations are separate.

## Generic destinations

`destinationSystems.ts` supplies data records with host, anchor, system-local AU quantities, render geometry, selection intent and provenance. The renderer iterates this shared contract instead of adding one branch per star. Scientific planetary orbital quantities remain distinct from illustrative phases/spacing. Unfitted companions use disclosed schematic layouts, not fabricated measured orbits.

## Materials and interaction

Materials share scene lighting and bounded activity envelopes. Earth day/night UVs stay registered. Auroral curtains use existing-loop animation and bounded geometry LODs. Quality changes reuse renderer ownership. Persistent stellar names retain every visible candidate; deterministic offsets reduce crowding without changing astronomical anchors. Wheel deltas ease through the existing loop into the original controls path; reduced-motion bypasses easing.

## Public build boundary

The public configuration removes the original Sites plugin, host identity, Cloudflare bindings and private operational README. It retains the application rather than exporting compiled deployment output. A standalone Vinext build is intentionally separate from the owner's unchanged hosted project. No CI deployment is configured.

## Verification boundaries

Source/data tests establish deterministic invariants, not visual quality. Production build establishes compilation, not runtime correctness. Browser smoke checks establish only the exercised paths. CPU label-layout measurements are not FPS/GPU benchmarks. Sustained performance, long-session memory behavior and broad accessibility coverage remain future work.
