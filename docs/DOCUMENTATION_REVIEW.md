# Documentation consistency review — 2026-10-23

## Scope

Reviewed every Markdown file present at the start of this review: README, changelog, contribution/security guidance, third-party notices, asset provenance, architecture, science, the initial release audit, roadmap and pull-request template. Also checked issue templates, package scripts/versions/engine declarations, the CI and Dependabot configurations, the published source-release description, and source modules relevant to documented counts, controls and hosting commands.

This is a documentation/consistency audit, not a new astrophysics peer review, penetration test, dependency upgrade or exhaustive application acceptance. Application logic, scientific values, assets, dependencies, CI configuration and the author's hosted deployment are unchanged.

## Corrections

| Finding | Correction |
| --- | --- |
| Internal milestone names and excluded-file wording could imply an incomplete repository | State explicitly that the complete application and standalone configuration are included; only personal deployment settings and internal notes are unnecessary/excluded |
| Local preview and public hosting were blurred | Provide the explicit loopback hostname, explain that bare production start binds all interfaces, and distinguish provider-specific hosting/security work |
| Build tools are in development dependencies | Explain why install/build/start instructions must not omit them |
| Catalog, navigation anchors and destinations could be mistaken for the same count | Explain 83 stellar/substellar entries + 24 exoplanets = 107 Catalog entries; Solar System planets are separate; spell out the four destination types |
| Changelog used a preparation heading rather than the published tag | Identify `v1.0.0-source.1`, its prerelease label and the separate `1.0.0` package version |
| Data-refresh wording referred readers to private research | Explain that bundled snapshots suffice to run/test the app, and that no automatic refresh command is currently provided |
| Existing Sirius reference could be confused with the proposed future orbit model | Distinguish current scale/period and fixed illustrative phase from future epoch-aware fitted orbits |
| A green check or Dependabot proposal could be mistaken for a completed security update | Distinguish default-branch and pull-request checks, document coordinated React updates, and state that Verify does not enforce dependency-vulnerability or browser-visual acceptance |
| Security reporting fallback lacked an actionable path | Explain how to request a private reporting channel without publicly disclosing sensitive details |

## Source-backed checks

- Imported the current typed data and verified: 83 stellar/substellar entries; 65 local anchors; 24 exoplanets; nine planet hosts; 107 Catalog entries; 64 destinations (nine planetary, one binary, 16 multiple and 38 single-object frames).
- Checked control descriptions against the keyboard/input handlers, and preview flags/default bind addresses against the installed Vinext CLI.
- Checked local Markdown links/anchors, documented npm script names, source paths and texture hashes against the repository. Scientific/provider references remain provenance links; this is not a guarantee that every external provider URL stays available.
- Read the failed CI logs for [dependency PR #6](https://github.com/10th-Dimension/helios-solar-explorer/pull/6) and [PR #7](https://github.com/10th-Dimension/helios-solar-explorer/pull/7). At review time, #6 failed build because React 19.3.1 did not match React DOM 19.2.9; #7 failed installation because its server-components package required React 19.3.1 while the proposal retained 19.2.9. Neither was merged or modified during this review.

## Remaining boundaries

The initial audit's dependency findings are retained as dated evidence, not rewritten into a clean bill of health. No new performance, accessibility or scientific certainty is claimed. The original source-release tag remains an immutable historical snapshot; use `main` for the corrected current documentation. Subsequent CI runs identify the exact revision they verify.
