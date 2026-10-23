# Security policy

The public edition requires no API credentials, database, account or application-owned authentication. A self-hosted copy is not private unless you configure your own hosting-layer access control.

## Reporting

Use **Report a vulnerability** under this repository's Security tab when available. Otherwise contact the maintainer privately before sharing sensitive details. Do not open public issues containing credentials, personal data or a working exploit against a private deployment.

Revoke/rotate leaked credentials immediately. Removing the newest file does not remove history, clones or caches; follow up with history cleanup and provider-specific incident handling.

## Expectations

The default branch is the maintained source. There is no security SLA or claim that historical tags are vulnerability-free. Review dependencies with `npm audit`; passing tests are not a security certification. [The release audit](docs/PUBLIC_RELEASE_AUDIT.md) records scope and unresolved findings.

Do not commit environment files, private keys, registry credentials, private hosting manifests, browser profiles, logs or build/runtime state. `NEXT_PUBLIC_*` settings are public: never put a secret there. Optional `NEXT_PUBLIC_SITE_URL` is a public metadata origin, not a credential. No environment file is needed locally.

The tracked-file guard does not replace dedicated secret scanning or human review. Keep CI permissions minimal and deployment secrets out of untrusted pull-request jobs.
