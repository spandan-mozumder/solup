# UI Package

Composable design‑system primitives & higher level components shared across apps.

## Structure
- `src/` – component source (button, card, code, etc.)
- `turbo/generators/` – scaffolding templates for new components

## Principles
- Headless where possible; styling via Tailwind utility classes
- Accessible: respect ARIA roles & keyboard interaction
- Theming aligned with `next-themes` (light/dark)

## Usage
Import components directly:
```tsx
import { Button } from "ui";
```

## Adding a Component
1. Run generator (future): `turbo gen component <Name>`
2. Implement in `src/<name>.tsx`
3. Export in `src/index.ts` (or package entry) if added later
4. Provide stories / usage notes (future Storybook integration)

## Roadmap
- Expand component set (Modal, Table, Tooltip)
- Add Storybook docs site
- Add visual regression tests
