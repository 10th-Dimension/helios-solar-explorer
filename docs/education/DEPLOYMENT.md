# Standalone education demo deployment

The Education 1.0 candidate runs from this repository without the author's hosting project, credentials, application account or database. No separately configured non-production deployment target was available in the reviewed repository. These instructions prepare an independent staging copy; they do not claim that a public demo has been deployed.

The owner subsequently approved production publication to [the existing public Helios Site](https://helios-solar-explorer.chasewilcox93.chatgpt.site/). The instructions below describe an independent staging copy, not a new deployment authorization. Future merges/releases/hosting changes must follow the owner’s current instructions.

## Build and local production verification

Use the Node version tested by the repository CI (Node.js 24) and npm. Keep development dependencies installed: Vinext is declared there but is also the production-server command.

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run audit:public
npm audit
npm run build
npm start -- --hostname 127.0.0.1 --port 3001
```

Open the address printed by the server. Test an Education lesson, its text alternative, quiz feedback, source inspection, an interior, stellar travel, returning Home and free exploration. Recheck using the classroom's keyboard, viewport and motion settings. Record failures instead of treating a successful build as a browser pass.

Review dependency findings separately. The historical public-release audit describes an older snapshot; use [the Education security review](../EDUCATION_SECURITY.md), [candidate validation evidence](../EDUCATION_VALIDATION.md) and the current audit output for this candidate.

## Independent public staging host

Choose a host that supports this Vinext/Vite application and its Node runtime. The source is not a static HTML export: uploading raw TSX files to a file server will not run it. A provider-specific Worker build can also be considered only after its adapter, entrypoint and runtime constraints are verified; do not replace the runtime solely to avoid doing that work.

For a Node staging host:

1. Deploy the exact reviewed feature-branch commit to a separate staging service with a distinct hostname. Record the commit and build identity.
2. Install with `npm ci`, build with `npm run build`, and start Vinext using the provider's assigned port. Keep runtime-required development packages installed.
3. Bind the server deliberately. Bare `npm start` listens on all interfaces; a local preview should use `127.0.0.1`. A hosted service should be behind the provider's intended reverse proxy, not an accidentally exposed development machine.
4. Configure TLS, logs without personal/student data, request/body/time limits and a rollback to the previous staging image or commit.
5. Review security headers at the hosting layer. Typical goals include `X-Content-Type-Options: nosniff`, a suitable `Referrer-Policy` and framing restrictions appropriate to classroom embedding. Test an application-specific Content Security Policy against bundled scripts, styles, font loading and source links rather than copying an untested strict policy.
6. Do not commit provider secrets, hosting identities, `.env` files or credentials. None is required by the educational application itself. Public metadata settings must never contain secrets.
7. Verify public routes and assets, Education completion/resume, source links, camera recovery, keyboard operation and a missing route on the actual staging URL. Check the response headers separately.

Keep the non-production service private or unlisted until its intended access and cost are approved. A source PR is not a deployed demo. If the provider needs new credentials, payment, a new account or an audience decision, stop that deployment step and request the specific missing authority while retaining the ready source and local verification.

## Production authorization

After reviewing the PR and candidate validation record, the owner must approve the exact merge/release and deployment target. Record the version, source SHA, artifact, access policy and rollback. Do not silently reuse or modify the owner's existing hosted app, even when a previous task authorized a different change there.
