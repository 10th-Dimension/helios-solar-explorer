# Education candidate security review

Review date: 2026-10-24. Baseline: `c208dcab8a5d04b806186c54ce7137a776fd0ddb`. This is a bounded dependency/application review, not a penetration test or a guarantee that the server is safe for arbitrary untrusted traffic.

## Baseline evidence

Fresh `npm audit --json` returned exit code 1 with **three high-severity affected packages, zero critical**. The three-package count includes a dependent package, not three independently proven application exploits.

| Dependency path | Baseline finding | Primary advisory and patched version |
| --- | --- | --- |
| `vinext@1.0.0-beta.3 → image-size@2.0.2` | JXL/HEIF and ICNS parsing can loop indefinitely on crafted input | [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr); `image-size@2.0.3` |
| `eslint-config-next → eslint-plugin-react-hooks → zod@4.4.3` | Oversized constrained collections can cause excessive validation issue allocation | [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5); `zod@4.6.6` |

Vinext is a development dependency but also runs the documented production command. An audit that omits development packages is therefore not a runtime safety test. The installed beta uses `imageSize(buffer)` for metadata extraction. No application-owned image-upload endpoint was identified in this bounded review, but that does not prove that every runtime parser path is unreachable.

## Remediation decision and validation boundary

The narrow compatible candidate is an exact, Vinext-scoped override to patched `image-size@2.0.3`, plus a compatible lockfile update to Zod 4.6.6 or later. The patched image-size release keeps the named API used by the existing metadata path. Retaining the framework avoids mixing a larger runtime migration into the education work.

Registry inspection also found Vinext 1.3.0, whose peer requirements include `@vitejs/plugin-rsc ^0.5.37`; the baseline uses 0.5.26. Its runtime dependencies differ. It should not be substituted solely because audit suggests it without building and exercising the resulting application.

Integration applied the Vinext-scoped image-size override and a compatible Zod update: image-size 2.0.2 → 2.0.3 and Zod 4.4.3 → 4.6.7 (the advisory's first patched version is 4.6.6). React, Vinext and the application runtime versions were retained. The fresh full audit after that change reported **zero findings**. This is a dependency-advisory result, not a security certification. Metadata/image checks, production build and browser-runtime evidence are recorded separately in the final validation report; those runtime results must not be inferred from the audit count. Rerun `npm audit` whenever the lockfile changes or before a hosting decision; advisories can change independently of source.

The patched named `imageSize(buffer)` API was exercised on the actual bundled assets: the share card parsed as PNG 1200×630, cloud JPEG as 2048×1024, day JPEG as 5400×2700 and night JPEG as 3600×1800. All four returned dimensions successfully. This confirms compatibility for those trusted asset formats; it is not adversarial parser testing or proof of exploit reachability.

The candidate production build was also served locally: root page returned 200, share-card PNG returned 200 with PNG content, the NASA day image returned 200 with JPEG content, and a missing route returned 404. An actual browser journey completed the four-stage Sun lesson through interior controls. A four-stage Beyond journey exercised Proxima, its planet and Home; the subsequent host-return camera adapter correction requires the recheck identified in [candidate validation](EDUCATION_VALIDATION.md). These are bounded runtime compatibility checks, not a penetration test. That report records final exact coverage, build identity and remaining limits. No remote demo or production deployment is implied.

## Application/privacy boundaries

- Education requires no account, API credential, database, student identity, advertising or analytics service.
- Lesson progress remains browser-local when storage is available. It is not a secure gradebook; shared browser profiles can expose prior local progress.
- Source links leave the application for the scientific provider. External providers have their own privacy policies.
- The existing font pipeline can contact Google Fonts. Do not promise a completely offline or zero-third-party-network experience without separately verifying font/asset behavior.
- Treat browser storage and URL input as untrusted. Validate saved lesson IDs, stage indices and answer shapes; do not interpolate stored strings into HTML.
- No `dangerouslySetInnerHTML` path is needed for lesson or source content. Use React text rendering and reviewed link protocols.

## Publication and server operation

Keep credentials, `.env` files, private hosting configuration, local paths and runtime logs out of the tracked release. Run `npm run audit:public` and the CI secret-history scanner, and review newly added assets manually. A clean scan is a detection result, not proof against every possible secret.

Use loopback binding for local production previews. For internet deployment, the operator must review TLS, response headers, framing/embedding policy, request limits, server updates and rollback. See [standalone deployment](education/DEPLOYMENT.md). Do not treat a green build or a source PR as a deployed, secured educational service.

No changes to the owner's existing hosted application, paid service or social account are authorized by this candidate task. No public non-production demo URL is claimed without an actual separate deployment and verification.
