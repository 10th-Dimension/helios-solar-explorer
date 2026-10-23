# Contributing to Helios

Open an issue before a large architectural change, new object class or catalog refresh. Describe the user problem, evidence and acceptance checks. Bug reports should include browser/OS, viewport, graphics tier and reproduction steps. Sanitize screenshots and logs.

## Before a pull request

Use Node 22.13+ (CI uses Node 24), install with `npm ci`, then run:

```bash
npm test
npm run typecheck
npm run lint
npm run audit:public
npm run build
git diff --check
```

Rendering changes also need actual desktop/narrow-browser checks: one canvas, selection, orbit/zoom, travel/return, interiors and console. Math tests do not prove a shader rendered or an interaction feels smooth.

## Boundaries

- Keep one renderer, scene, camera, controls instance, loop and canvas.
- Keep scientific coordinates and measurements separate from render transforms.
- Preserve stories, environments, comparisons, confidence and provenance.
- Do not revise scientific numbers from memory. Cite primary sources, preserve query dates and explain changes.
- Data updates must be deliberate, reviewed operations—not install/build side effects.
- Distinguish mass/minimum mass, inferred/measured radii and unresolved/resolved sources.
- Do not invent observed exoplanet geography, atmospheres, life or interiors.
- Keep information deliberate and Catalog secondary to spatial exploration.
- Never commit credentials, `.env` files, private hosting configuration, local paths, runtime state or private handoffs.

Explain what changed, why, what you tested and what remains untested. Include captures for visuals and measured before/after evidence for performance claims. Keep unrelated upgrades out of feature work. Contributions must be yours to contribute under MIT; identify third-party material and its terms separately.
