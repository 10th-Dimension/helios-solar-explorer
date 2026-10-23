# Public-release audit — 2026-10-23

## Scope

This report concerns the sanitized public source snapshot, not an assurance about every historical private commit, a penetration test or a legal opinion. Original application baseline: `a4bd78a320c59e6edd920b37f155b02bc65b6329` (completed Home naming and wheel smoothing).

All application TypeScript/TSX modules, scientific JSON snapshots, tests and credited texture JPEGs are preserved from that baseline. The legacy CSS Earth preview now references the credited NASA JPEG rather than the old PNG whose exact download provenance was incomplete. Public documentation is newly written from completed milestone records. Original renderer/data behavior was not rebuilt.

## Publication boundary

- A new public Git history starts from GitHub's MIT initialization and this audited source snapshot. No original private `.git` database or removed historical content is imported.
- Original hosting identity/manifest, source remote, private deployment URLs, access-policy principals, operational handoffs, local machine paths and private validation receipts are excluded.
- No environment files, tokens, registry credentials, private keys, database bindings, browser sessions, runtime logs, build output or installed dependencies belong in the tracked publication.
- The original private source repository and owner-only deployment are unchanged. Public code is not public access to that deployment.
- Commit identity uses the author's GitHub noreply address, not a personal email.

## Secret/privacy checks

The release process uses **Gitleaks 8.30.1** with redaction and default rules, downloaded from the official release and checked against its published SHA-256 manifest. Both the final files and reachable public Git history are checked. No detected credential finding is accepted or suppressed with a broad allowlist.

`npm run audit:public` additionally checks the tracked publication set for forbidden environment/key/runtime paths; recognizable provider tokens; literal authorization headers; credential-bearing URLs; original hosting identifiers/URLs; local user paths; personal email domains; unreviewed binary types; and lockfile URLs outside the public npm registry. It deliberately reports locations/rules rather than potential secret values. The guard is included in CI alongside a full-history Gitleaks run.

The three NASA JPEG hashes are retained in `public/ASSET_PROVENANCE.md`. Application screenshot and share-card metadata are reviewed separately. A clean scanner result cannot prove that no arbitrary secret or personal detail exists; manual review and future scanning remain necessary.

## Dependency findings—do not hide these

The inherited standalone dependency set initially reported **18 affected packages: 17 high and one critical**. The public edition updates Next.js/eslint-config-next to 16.4.3, React/React DOM/RSC to 19.2.9 and Vite to 8.3.5, and applies available non-forced compatible lockfile fixes. The hosted application's dependencies are not changed.

After those changes, `npm audit` reports **nine high-severity affected packages, zero critical**, tracing to two dependency families:

- `braces` deeply nested-pattern stack-exhaustion denial of service ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)), via micromatch/fast-glob, ESLint configuration and Vinext import plugins.
- `image-size` parser infinite-loop denial of service ([JXL/HEIF](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [ICNS](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)), via the retained Vinext version.

The full nine-package count includes dependent packages, not nine independently confirmed exploitable application paths. `npm audit --omit=dev` reports zero findings, **but Vinext is a development dependency also used by the documented production-server command**, so that filtered result is not a safe-runtime certification. Reachability/exploitability has not been established. No force-downgrade of the ESLint stack, unreviewed dependency override or broad Vinext migration is hidden in this source release. Reassess and resolve these before exposing a self-hosted server to untrusted traffic; keep local development bound to loopback.

## Functional verification and limits

The public edition's scientific/data, aurora-geometry and wheel-easing suites, strict TypeScript check, lint and standalone production build are run before publication. The build retains the large-client-chunk warning and Vinext's static route-classification notice. Those notices are not secret exposures.

A standalone production-server browser smoke check covers actual canvas rendering and representative navigation; it is not an exhaustive feature reacceptance, cross-device GPU study or long-duration memory test. Historical private-Site checks are not substituted for this public build's runtime check. CI records the exact repository commit it tests; a local pass is not a claim that a remote workflow has passed.

## Rights boundary

MIT covers original application code/documentation only. NASA imagery, CDS/SIMBAD records, archive parameters, fonts and upstream packages retain their own rights. Source credits, raw scientific responses and usage-policy links are preserved in [third-party notices](../THIRD_PARTY_NOTICES.md). Private research drafts and obsolete staging instructions are not passed off as current public documentation.
