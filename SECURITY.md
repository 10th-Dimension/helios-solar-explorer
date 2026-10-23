# Security policy

The public edition requires no API credentials, database, account or application-owned authentication. A self-hosted copy is not private unless you configure your own hosting-layer access control.

## Reporting

Use **Report a vulnerability** under this repository's Security tab when that feature is available. If it is unavailable and you do not already have a private contact channel, open an issue asking the maintainer to arrange one, without including vulnerability details. Do not open public issues containing credentials, personal data or a working exploit against a private deployment.

Revoke/rotate leaked credentials immediately. Removing the newest file does not remove history, clones or caches; follow up with history cleanup and provider-specific incident handling.

## Expectations

The default branch is the maintained source. There is no security SLA or claim that historical tags are vulnerability-free. Review dependencies with `npm audit`; passing tests are not a security certification. [The release audit](docs/PUBLIC_RELEASE_AUDIT.md) records scope and unresolved findings.

Do not commit environment files, private keys, registry credentials, private hosting manifests, browser profiles, logs or build/runtime state. `NEXT_PUBLIC_*` settings are public: never put a secret there. Optional `NEXT_PUBLIC_SITE_URL` is a public metadata origin, not a credential. No environment file is needed locally.

The tracked-file guard does not replace dedicated secret scanning or human review. Keep CI permissions minimal and deployment secrets out of untrusted pull-request jobs.

## Local preview versus internet hosting

Use `npm run build` followed by `npm start -- --hostname 127.0.0.1` for a local production-build preview. Bare `npm start` binds to all network interfaces by default. Helios does not configure your firewall, TLS, authentication or deployment provider, and the MIT license is not a claim that the current server/dependency stack is ready for untrusted traffic.

The Verify workflow does not enforce `npm audit`; a green check does not mean zero vulnerable dependencies. Dependabot pull requests are proposals, not applied fixes. The audit report records dated findings for a particular source revision; rerun the audit before making a new hosting decision.
