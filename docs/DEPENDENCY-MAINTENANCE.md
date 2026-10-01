# Dependency maintenance

## Security refresh — 2026-10-01

Atlas uses Next.js 15.5.27 and React/React DOM 19.3.0 after upgrading the vulnerable Next.js 13 baseline. TypeScript and React types were updated together, along with compatible dependency resolutions. The theme and drawer adapters were updated for React 19 peer compatibility. The unused direct Next.js 13 SWC WASM package was removed; Next manages its own compiler dependency.

Next.js 15 requires asynchronous page parameters. Project and CMC token routes now await their parameters, and the local-development chart page awaits its query parameters. Saved research schemas and storage keys are unchanged.

The root PostCSS dependency is pinned to 8.5.28. A scoped `next` override resolves Next's nested PostCSS to that same patched version; without this override Next.js 15.5.27 pins a vulnerable older copy. This replaces the dependency rather than suppressing audit findings. Reassess the override when upgrading Next.js.

Validation uses a clean `npm ci` in an isolated source copy with no local credentials. Run `npm audit`, typecheck, lint, the fixture test suite and a production build after dependency changes. Audit results are time-specific and do not certify deployed authentication, database policies, API budgets or overall application security. The present process-local caches and quotas still require deployment-specific review.

The framework migration follows the [official Next.js 15 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-15). Some packages still carry deprecation notices; zero known advisories does not imply every dependency is on its newest major version.
