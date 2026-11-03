# Dependency and documentation maintenance — 2026-11-03

This review follows source baseline `df2d2ad10fbd8961847ca83681b2592f6ba44edc`, package 1.1.2. It describes local source checks, not the current identity of the separately hosted build.

## Audit findings

A clean install and `npm audit` reported 16 moderate package findings associated with [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), a minimatch pattern-amplification advisory. The findings propagate through lint-tool dependencies; they are not 16 independently identified exploits. No high/critical findings were reported. `npm audit --omit=dev` reported zero findings, but runtime-required Vinext is a development dependency, so this command alone is not a complete deployment assessment.

The advisory lists versions below 11.0.1 as affected and 11.0.1 as patched. The installed lint tools require earlier minimatch majors. Registry inspection on the review date found no patched release within those installed majors. ESLint 9.39.5 still requires minimatch ^3.1.5, and eslint-config-next 16.4.4 still depends on the same plugin families. Updating these direct packages alone would not remove the reported dependency paths. Moving every consumer to minimatch 11 would override API compatibility; it was not forced.

The advisory describes attacker-controlled patterns and preprocessing at optimizationLevel >= 2. This review did not demonstrate exploitation through HELIOS's fixed lint invocation. Keep the finding open, monitor compatible upstream releases, and inspect actual caller/API behavior before selecting a fix. Do not apply npm's suggested major downgrades or treat an audit warning as proof of a public application exploit.

CI uses `npm audit --audit-level=high`; moderate findings can coexist with a passing step. Past release notes reporting zero findings describe their dated dependency/advisory state, not a perpetual guarantee.

## Documentation changes

The README now presents the application, an actual interior capture, feature overview and quick start before maintenance material. Detailed verification and hosting notes are in [Development](DEVELOPMENT.md); browser task coverage is in [Browser testing](BROWSER_TESTING.md). Current contributor guidance reflects the audit threshold. Education's index identifies 1.1.0 as its first release rather than the current package version.

Scientific records, raw snapshots, confidence/status definitions, package release number and mobile AUTO policy are preserved. The README describes inventory counts as a curated snapshot and links unresolved scientific quantities to the existing audit. It does not claim every record is newly reconciled or the hosted deployment matches this source branch.
