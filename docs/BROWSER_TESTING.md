# Browser testing

The Playwright suite runs against a local production build. Install dependencies and browser binaries, then build before running it:

```bash
npm ci --strict-peer-deps
npx playwright install --with-deps chromium firefox webkit
npm run build
npm run test:browser
```

The default configuration uses one worker to keep concurrent WebGL scenes from competing for resources. It starts a fresh loopback-only server on port 4173 for every run. If that port is occupied, the suite stops instead of silently reusing a stale preview. Build the source before testing.

For a focused desktop run:

```bash
npm run test:browser -- --project=chromium
```

## Covered tasks

- A single rendered canvas, Earth selection, interior layers, evidence disclosure, zoom/rotation and a moving layer leader.
- All four lessons completed through their written alternatives and questions in the controlled WebGL-fallback DOM, including completion persistence after reload. Rendered scene travel is covered by the separate interior/dismissal/exoplanet cases.
- Optional retry, resume and progression after an incorrect answer.
- Lesson dismissal while a pending target is traveling, without a stale interior opening later.
- Catalog-to-exoplanet travel and return Home in the same scene.
- Science-dialog keyboard focus containment and restoration with Escape.
- Manual pause and system reduced motion, retaining deliberate world navigation.
- Controlled WebGL initialization failure, world information and lesson access.
- No-3D Proxima lesson stages and Sirius Catalog access without frozen stellar travel; explicit written completion remains distinct from a scene visit.
- Closing/reopening approached exoplanet information while retaining the selected planet, and short-screen Catalog wheel/keyboard scrolling without scrolling the scene.
- A 390×844 layout: AUTO remains selected, lesson/scene switching works, and the page has no horizontal overflow.

Chromium and WebKit run the full suite. The Firefox project runs the lesson, keyboard, narrow-layout and controlled-fallback cases; it excludes the four `@webgl` rendering cases because headless Firefox in this environment does not provide WebGL. This is an explicit coverage boundary, not a rendering pass for Firefox. Browser emulation does not reproduce physical phones or every GPU. Chromium uses SwiftShader in this configuration to make rendering available on headless CI; its frame timings are software-renderer diagnostics, not hardware performance claims.

Failures produce local screenshots and traces under ignored `test-results/`; the HTML report is under ignored `playwright-report/`. Inspect them locally:

```bash
npx playwright show-report
npx playwright show-trace test-results/<failed-case>/trace.zip
```

These tasks supplement the deterministic `npm test` checks. They do not exhaust every camera path, establish complete accessibility conformance, validate every scientific statement or prove long-session resource stability. Rendering changes still deserve a visual review of actual captures, and performance changes need before/after measurements on the intended hardware.

The test inventory is not a run receipt. A cloud VM's no-WebGL pass does not establish a 3D-rendering pass. Record the exact commit, projects/scenarios executed and failures or skipped cases; keep reset/device/renderer limits explicit. See [the roadmap verification record](ROADMAP_IMPLEMENTATION.md).
