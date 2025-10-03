# TypeScript Config Package

Centralized shareable `tsconfig` presets consumed by apps and packages.

## Files

- `base.json` – core options (strictness, module resolution)
- `react-library.json` – extends base for component libraries
- `nextjs.json` – extends base with Next.js specific settings

## Usage

In a consuming `tsconfig.json`:

```jsonc
{
  "extends": "typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
  },
}
```

## Guidelines

- Prefer updating `base.json` only when change benefits most packages.
- Avoid enabling experimental TS flags repo-wide without discussion.
- Keep path aliases minimal; use package boundaries instead.

## Roadmap

- Add `node-lib.json` for pure server utilities
- Introduce stricter incremental build diagnostics
