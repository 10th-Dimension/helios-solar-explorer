# Public-release audit — 2026-10-23

## Scope

This is a dated record of the initial public source release, [commit `4309365`](https://github.com/10th-Dimension/helios-solar-explorer/commit/43093656e11b3a7729f2003882cf67c4244b3ca8), tagged `v1.0.0-source.1` on 2026-10-23. It is not a current vulnerability count for every future revision, a penetration test, a legal opinion or a guarantee about all original development history. The later [documentation review](DOCUMENTATION_REVIEW.md) records wording and consistency corrections without changing application code or dependencies.

The release includes the complete application TypeScript/TSX modules, scientific JSON snapshots, tests and credited texture JPEGs. The legacy CSS Earth preview references the credited NASA JPEG rather than an older PNG whose exact download provenance was incomplete. Public documentation describes the features and setup; it is not a substitute for missing application code. The renderer and scientific data were not rebuilt for publication.

## Publication boundary

- A new public Git history starts from GitHub's MIT initialization and this audited source snapshot. No original private `.git` database or removed historical content is imported.
- Only deployment-specific identity/settings and internal development records are excluded: the original hosting manifest, private source remote/URLs, account access lists, local machine paths and validation receipts. These are not runtime dependencies and are not needed to run or modify the public application.
- No environment files, tokens, registry credentials, private keys, database bindings, browser sessions, runtime logs, build output or installed dependencies belong in the tracked publication.
- The original private source repository and owner-only deployment are unchanged. Public code is not public access to that deployment.
- Commit identity uses the author's GitHub noreply address, not a personal email.

## Secret/privacy checks

The initial release used **Gitleaks 8.30.1** with redaction and default rules, downloaded from the official release and checked against its published SHA-256 manifest. The 58-file source snapshot and reachable public Git history produced no detected credential findings. The tracked-file guard also produced no findings. No broad scanner allowlist was used to suppress detections.

`npm run audit:public` additionally checks the tracked publication set for forbidden environment/key/runtime paths; recognizable provider tokens; literal authorization headers; credential-bearing URLs; original hosting identifiers/URLs; local user paths; personal email domains; unreviewed binary types; and lockfile URLs outside the public npm registry. It deliberately reports locations/rules rather than potential secret values. The guard is included in CI alongside a full-history Gitleaks run.

The three NASA JPEG hashes are retained in `public/ASSET_PROVENANCE.md`. Application screenshot and share-card metadata are reviewed separately. A clean scanner result cannot prove that no arbitrary secret or personal detail exists; manual review and future scanning remain necessary.

## Dependency findings at the initial release

The inherited standalone dependency set initially reported **18 affected packages: 17 high and one critical**. The public edition updates Next.js/eslint-config-next to 16.4.3, React/React DOM/RSC to 19.2.9 and Vite to 8.3.5, and applies available non-forced compatible lockfile fixes. The hosted application's dependencies are not changed.

For the initial public-release lockfile, `npm audit` reported **nine high-severity affected packages, zero critical**, tracing to two dependency families:

- `braces` deeply nested-pattern stack-exhaustion denial of service ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)), via micromatch/fast-glob, ESLint configuration and Vinext import plugins.
- `image-size` parser infinite-loop denial of service ([JXL/HEIF](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [ICNS](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr)), via the retained Vinext version.

The full nine-package count includes dependent packages, not nine independently confirmed exploitable application paths. `npm audit --omit=dev` reported zero findings, **but Vinext is a development dependency also used by the documented production-server command**, so that filtered result is not a safe-runtime certification. Reachability/exploitability has not been established. The release did not force-downgrade the ESLint stack, add dependency overrides or migrate Vinext. Rerun and reassess the audit before exposing a self-hosted server to untrusted traffic. Use `npm start -- --hostname 127.0.0.1` for a local production-build preview; bare `npm start` listens on all network interfaces.

## Functional verification and limits

The [initial release's GitHub Verify run](https://github.com/10th-Dimension/helios-solar-explorer/actions/runs/39969012430) passed installation, scientific/data tests, aurora-geometry and wheel-easing suites, strict TypeScript, lint, the standalone production build and history secret scanning. The build retained the large-client-chunk warning and Vinext's static route-classification notice. Those notices are not secret exposures. Verify does not run an enforcing `npm audit` check or browser-based visual tests; its green result is not a claim of zero vulnerable dependencies.

A separate local production-server browser check covered actual canvas rendering, Earth travel, aurora, interiors, system return and Catalog. It was not an exhaustive feature acceptance, cross-device GPU study or long-duration memory test. The local browser results and the remote CI result are distinct pieces of evidence; later pull requests have their own independent results.

## Rights boundary

MIT covers original application code/documentation only. NASA imagery, CDS/SIMBAD records, archive parameters, fonts and upstream packages retain their own rights. Source credits, raw scientific responses and usage-policy links are preserved in [third-party notices](../THIRD_PARTY_NOTICES.md).
