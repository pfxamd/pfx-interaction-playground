# Core provenance and reproducibility

This repository includes a **local, unmodified code snapshot** of PFx Interaction Core:

- Upstream: https://github.com/pfxamd/PFx-Interaction-Core
- Immutable release tag: **v0.1.0**
- Source commit: `036551d7e6cf9da4fd276a9d74fea06c8dc15f21`
- Included workspace packages: `@pfx/interaction-core`, `@pfx/interaction-dom`, `@pfx/interaction-react`, `@pfx/interaction-testing`
- License: **Apache-2.0**, with the original LICENSE and NOTICE preserved in the root and every included package.

The complete TypeScript source, package metadata, unit tests and build definitions were copied from that release. The application and its browser tests are maintained separately here.

The browser site is compiled from these **local** packages. Nothing at runtime or build time fetches executable code from the upstream repository. External package registries are used only to install standard development dependencies according to the committed lockfile.

To upgrade, select a new upstream release, copy all affected sources and package metadata together, refresh the lockfile if necessary, run the full CI matrix, and amend this provenance record. Never silently modify the frozen upstream sources in the application repo.
