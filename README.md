# PFx Interaction Playground

**A hands-on interaction laboratory built by PFxamd.**

Eight real interactive demonstrations of pointer input, keyboard control, snapping, constrained motion, and spring physics. This is an independently maintained application; the reusable core lives in a [separate source repository](https://github.com/pfxamd/PFx-Interaction-Core).

[**Launch the playground**](https://pfxamd.github.io/pfx-interaction-playground/) · [**Interaction Core v0.1.0**](https://github.com/pfxamd/PFx-Interaction-Core/releases/tag/v0.1.0)

## What you can explore

| Module | Interaction |
| --- | --- |
| Axis + Precision | Horizontal drag, arrows, and Shift fine adjustment |
| Vertical Axis | One-dimensional vertical slider |
| XY Control | Bounded two-dimensional pointer input |
| Rotary + Detents | Angle rotation, precision, and snap increments |
| Free Drag | Unrestricted relative movement |
| Spring Return | Drag with physics-driven return to origin |
| Snap Points | Quantized values and predictable detents |
| Input Probe | Mouse, touch, pen, and pressure signals |

Every demonstration uses local copies of the real **PFx Interaction Core v0.1.0** packages. There are no remote imports, Git submodules, or build-time requests to the upstream repository. The checked-in workspace sources are a fixed snapshot, not a fork that changes the core's public API. See [CORE_PROVENANCE.md](./CORE_PROVENANCE.md).

## Run locally

Requires Node.js 22+ and pnpm 12.9.1. The lockfile fixes dependency resolution.

```bash
corepack enable
corepack prepare pnpm@12.9.1 --activate
pnpm install --frozen-lockfile
pnpm --filter @pfx/playground dev
```

Run verification before making changes:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium firefox webkit
pnpm test:e2e
```

## Repository structure

```text
apps/playground/       Interactive website (React, TypeScript, Vite, CSS)
packages/              Local frozen source snapshot of Core v0.1.0
tests/e2e/             Browser interaction and responsive tests
.github/workflows/     Automated validation and GitHub Pages deployment
```

**To work on the reusable interaction engine**, contribute at [PFx Interaction Core](https://github.com/pfxamd/PFx-Interaction-Core). Changes in this repository should focus on the interactive demonstrations, visual presentation, accessibility, and experience. To update the frozen core snapshot, import a separately tagged release and record its commit and version.

## Deployment

The [Pages workflow](./.github/workflows/pages.yml) builds a static site with a repository-specific base path, then deploys it independently of PFx Interaction Core. In repository **Settings → Pages → Build and deployment**, set the source to **GitHub Actions** once. Trigger the workflow again if Pages was not yet enabled.

Production site: [https://pfxamd.github.io/pfx-interaction-playground/](https://pfxamd.github.io/pfx-interaction-playground/).

## License

Apache-2.0. See [LICENSE](./LICENSE), [NOTICE](./NOTICE), and [CORE_PROVENANCE.md](./CORE_PROVENANCE.md). The PFxamd brand artwork is reproduced from the maintainer's original brand-assets repository and remains associated with its owner.
