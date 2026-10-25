# Contributing to Helios

For Education 1.0, read [the lesson contributor guide](docs/education/CONTRIBUTING_LESSONS.md) and [the scientific audit](docs/SCIENCE_AUDIT.md). Preserve claim/source IDs, confidence, separate source dates and raw snapshots. Scientific-correction and education/accessibility issue forms are available.

Open an issue before a large architectural change, new object class or catalog refresh. Describe the user problem, evidence and acceptance checks. Bug reports should include browser/OS, viewport, graphics tier and reproduction steps. Sanitize screenshots and logs.

## Before a pull request

Use Node 24 to match CI (the declared minimum is 22.13), install with `npm ci`, then run:

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
- Never commit credentials, `.env` files, personal deployment settings, local machine paths, runtime state or internal development notes containing private information. Provider-neutral setup instructions belong in public documentation.

## Dependency updates

Dependabot proposes npm and GitHub Actions updates. It does not merge them automatically. Inspect the default branch's check result separately from an open pull request's result; a failed proposal does not mean that change is already in the application.

Update React, React DOM and `react-server-dom-webpack` as a compatible set, and check Vinext/plugin peer requirements. Do not upgrade one member independently or use `--force`/`--legacy-peer-deps` to conceal a conflict. Update the lockfile, run a clean `npm ci`, execute the full verification workflow and inspect the browser before merging framework changes. Type definitions must remain compatible too.

Passing CI establishes only the configured checks. The Verify workflow runs secret scans and functional/build checks, not an enforcing dependency-vulnerability audit or browser-based visual test. Review `npm audit` separately, explain unresolved findings and provide browser evidence when rendering or framework behavior can change. Do not merge solely because a proposal has a green badge.

Explain what changed, why, what you tested and what remains untested. Include captures for visuals and measured before/after evidence for performance claims. Keep unrelated upgrades out of feature work. Contributions must be yours to contribute under MIT; identify third-party material and its terms separately.
