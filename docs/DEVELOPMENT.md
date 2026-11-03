# Development and verification

Use Node.js 24 for the recommended local environment. The declared minimum is Node.js 22.13.0. The Verify workflow pins its Node/npm matrix in [verify.yml](../.github/workflows/verify.yml); those versions describe CI, not a requirement to match every local npm patch.

## Install and check

```bash
npm ci --strict-peer-deps
npm ls --all
npm test
npm run typecheck
npm run lint
npm run audit:public
npm audit
npm run build
git diff --check
```

`npm test` runs the stellar/data, aurora, wheel, solar, science, education, interior-leader and interaction-state checks. They test deterministic contracts, geometry and controller behavior. Actual browser checks are separate: see [Browser testing](BROWSER_TESTING.md).

`audit:public` scans tracked files for forbidden packaging and common disclosure patterns. It does not inspect untracked files or prove the absence of every secret. CI additionally scans reachable Git history with Gitleaks.

CI runs `npm audit --audit-level=high`: high or critical findings fail that step, while moderate findings can be reported without failing it. Consult current audit output and the [dated maintenance review](MAINTENANCE_REVIEW.md), rather than treating a past zero-finding result as current evidence. Do not use automatic forced upgrades to bypass peer or API incompatibilities.

## Local preview and hosting

```bash
npm run dev
# Or build and preview:
npm run build
npm start -- --hostname 127.0.0.1
```

Keep development dependencies installed: Vinext is declared there and is needed for both build and start. Bare `npm start` listens on all network interfaces. The explicit hostname above binds the preview to this computer. Raw TSX source is not a static HTML export.

No application account, API key, database or environment file is required. `private: true` in package.json prevents npm publication; it does not restrict GitHub access or change the code license. Font processing may require external requests. The optional public `NEXT_PUBLIC_SITE_URL` setting controls absolute metadata URLs for a deployed copy; it is not a credential.

The repository's Verify workflow does not deploy the application. Hosted builds may have provider-specific configuration and can differ from main. Record the deployed source commit when comparing a hosted build with a release. See [hosting guidance](education/DEPLOYMENT.md).

## Readable source changes

Keep scene ownership and scientific contracts intact. Prefer small responsibility-based extractions supported by regression tests. Format a touched component with the repository's pinned formatter:

```bash
npm exec prettier -- --write app/page.tsx
```

Formatting checks apply to the explicitly formatted interaction components; they are not a demand to reformat every scientific data file. Dependency versions and held-upgrade history belong in package metadata, release notes and contributor guidance, rather than the README opening.
