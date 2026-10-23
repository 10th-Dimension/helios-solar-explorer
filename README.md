# Helios — Solar System Explorer

**Explore our home system. Keep going.**

[![MIT code license](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Verify](https://github.com/10th-Dimension/helios-solar-explorer/actions/workflows/verify.yml/badge.svg)](https://github.com/10th-Dimension/helios-solar-explorer/actions/workflows/verify.yml)

Helios is an interactive, spatial-first cosmic atlas built by **Chase Wilcox**. Start at **Home [Our Sun]**, orbit the planets, open their 3D interiors, then move outward into a neighborhood of real cataloged stars and confirmed exoplanets—all inside one continuous Three.js scene.

The universe is the interface. Information appears when you ask for it, not every time you select something. A beautiful visualization should never pretend we know more than we do.

![The Helios stellar neighborhood with persistent selectable names](docs/images/stellar-neighborhood.jpg)

*Actual application capture. Bright selectable objects are catalog-backed; the faint distant field is illustrative. Positions, sizes and travel are transformed for navigation.*

## What you can explore

| Included now | Scope |
| --- | --- |
| Solar System | The Sun and all eight planets, distinct exteriors, Planet Stories, environments and Earth-relative comparisons |
| Interiors | Interactive 3D regional cutaways, layer selection and explanations of what is measured, inferred or model-dependent |
| Stellar neighborhood | 83 stellar/substellar source records represented by 65 selectable local navigation anchors |
| Destinations | 64 data-driven external destination records: planetary systems, binaries, multiples and stellar reference frames |
| Confirmed exoplanets | 24 curated planets across nine hosts, with references and explicit mass/radius confidence |
| Catalog | 107 stellar/substellar/planet entries with name, class, distance, spectral and system filters |

### A living scene, not a slideshow

- Orbit, approach, release into six-axis drift, refocus and travel without replacing the canvas.
- Select visible stars through small persistent names, without zooming to reveal a label.
- See NASA historical Earth day, night-light and cloud composites with illumination-aware city lights.
- Toggle folded auroral curtains and Earth's polar-night view. Aurora activity is procedural—not live space weather.
- Inspect Saturn/Uranus rings, body-specific spin axes, retrograde rotation, giant-planet materials and solar activity illustrations.
- Choose AUTO, ULTRA, HIGH or BALANCED quality; narrow viewports use a lower automatic tier.
- Keep exploration quiet with on-demand information, Catalog/Explore overlays and HUD hiding.
- Use eased wheel zoom with bounded input slices and reduced-motion handling.

## Run locally

Requires **Node.js 22.13 or newer**, npm and a modern WebGL-capable browser. CI uses Node 24.

```bash
git clone https://github.com/10th-Dimension/helios-solar-explorer.git
cd helios-solar-explorer
npm ci
npm run dev
```

Open the local address printed by the server (normally `http://localhost:3000`). **No API key, account, database or `.env` file is required.** Installation requires internet access; the font pipeline may contact Google Fonts. Astronomical records and Earth textures are local; source links open their providers.

```bash
npm test               # Stellar/data, aurora geometry and wheel checks
npm run typecheck
npm run lint
npm run audit:public   # Tracked-file secret/privacy/packaging guard
npm run build
npm start              # Serve the standalone production build
```

The public edition has a standalone Vinext/Vite configuration, with no original hosting project ID or credentials. Self-hosting is separate; this repository does not publish or grant access to the author's private deployment. `private: true` in `package.json` only prevents accidental npm publication; it does not restrict the GitHub repository or MIT license.

## Controls

| Action | Control |
| --- | --- |
| Orbit/look | Drag |
| Approach / change view depth | Scroll or pinch |
| Select | Click an object or its name; Catalog is an alternative |
| Free drift | Release focus, then W/A/S/D and Q/E; Shift accelerates |
| Information | INFO or I |
| Interior | Interior control or X |
| Hide/restore HUD | HUD control or M |
| Back out of the current interaction | Escape |
| Adjacent Solar System world | Left/right arrows |

Actions depend on the object and frame. Mobile layouts retain on-screen controls.

## Scientific honesty is part of the design

Typed records and the interface distinguish **measured**, **inferred**, **uncertain**, **unknown** and **illustrative** information.

- Scientific AU/light-year values are not Three.js coordinates. Spacing, size, travel duration and cutaways are navigation/teaching transforms.
- Solar System phases are illustrative, not current ephemerides. Body poles use J2000 orientation with accelerated visual spin.
- Stellar source astrometry remains ICRS J2000.0. A linear motion approximation produces fixed **Julian epoch 2026.81**; missing velocities are held, not measured zero.
- The expansion snapshot was retrieved **2026-10-23 UTC**. Original records retain earlier query dates. Counts describe this curated snapshot, not a complete current census.
- Confirmed does not mean directly photographed. Calculated radii remain inferred; dynamical and minimum masses are distinguished.
- Controversial Tau Ceti planet rows and candidate Proxima c are not presented as confirmed destinations.
- No invented exoplanet continents, oceans, atmospheres, life or interiors are presented as observations.
- Historical imagery, auroras, solar activity and giant-planet weather are not live feeds.

See [Science and data](docs/SCIENCE.md), [third-party notices](THIRD_PARTY_NOTICES.md), and the raw [SIMBAD](data/simbad-snapshot.json) / [NASA Exoplanet Archive](data/archive-snapshot.json) query snapshots.

## Inside the project

Built with **React 19, TypeScript, Three.js, Vinext and Vite**, plus Tailwind/PostCSS. This is the existing application, not a replacement implementation.

```text
app/
  SolarSystemScene.tsx    Single renderer, scene, camera, controls and loop
  page.tsx               Explore/Catalog state, docks and science UI
  worlds.ts              Solar System narratives, facts and interiors
  spatial.ts             Scientific/render Solar System separation
  stellar.ts             Stellar contracts, epoch model and transforms
  nearbyCatalog.ts       Expanded stellar/substellar records
  exoplanets.ts          Planet contract and original Proxima records
  exoplanetExpansion.ts  Added confirmed planets and references
  destinationSystems.ts Data-driven system-local architecture
  cosmicCoordinates.ts  Render-only floating origin
  stellarLabels.ts      Persistent names and offset placement
  celestialMaterials.ts Earth, atmosphere, ring and solar GPU materials
  auroraCurtains.ts      Polar curtain geometry and emission shader
  bodyOrientation.ts    Source-backed poles and signed visual spin
  graphicsQuality.ts    Explicit rendering budgets
  smoothWheel.ts        Bounded frame-independent wheel easing
data/                    Raw scientific query snapshots
public/                  Credited textures and application assets
scripts/                 Science, geometry, input and release checks
docs/                    Architecture, science, roadmap and audit
```

[Architecture](docs/ARCHITECTURE.md) records the invariants. [Changelog](CHANGELOG.md) describes completed milestones without publishing private operational handoffs.

## What's next

Helios is intended to grow. The next direction is **system detail and spatial fidelity**, not an indiscriminate star dump:

- Fitted binary orbits with uncertainty and honest missing-data handling.
- Better planet-host illumination and ring shadows onto globes.
- Measured GPU profiling, texture/geometry streaming and large-catalog interaction work.
- Optional observed space-weather playback, separate from procedural previews.
- Carefully sourced moons and more nearby systems once their contracts are ready.
- Automated browser, accessibility, reduced-motion and long-session coverage.

These are plans, not implemented features or promised dates. See the [roadmap](docs/ROADMAP.md).

## Current limitations

Helios is educational software, not a navigation instrument, precision ephemeris engine or complete survey. Interiors are simplified, atmosphere/ring lighting is approximate, and unresolved companions may use schematic layouts. The scene is preloaded rather than streamed. Dense names can overlap, the Three.js client chunk is large, and ULTRA can be expensive. Short browser checks do not establish sustained GPU performance or leak freedom. Accessibility coverage is incomplete.

See [the public-release audit](docs/PUBLIC_RELEASE_AUDIT.md) for dependency findings and verification scope. A clean secret scan is not a guarantee against every possible disclosure or vulnerability.

## Contributing and credits

Focused issues, primary-source corrections, performance measurements and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), and report security problems privately using [SECURITY.md](SECURITY.md).

Built by [Chase Wilcox / 10th-Dimension](https://github.com/10th-Dimension), with AI-assisted development. Scientific providers and upstream libraries are credited separately; no affiliation or endorsement is implied.

## License

Original application code and original documentation are **[MIT-licensed](LICENSE)**. NASA imagery, CDS/SIMBAD data, NASA Exoplanet Archive records, fonts and dependencies retain their own rights and terms. The MIT grant does **not** relicense them; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
