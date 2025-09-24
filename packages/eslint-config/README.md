# ESLint Config Package

Shared reusable flat ESLint configurations for monorepo packages & apps.

## Files
- `base.js` – baseline TS/JS rules
- `react-internal.js` – React + hooks rules
- `next.js` – Next.js specific layering/extensions

## Usage
In a consuming project `eslint.config.mjs`:
```js
import base from "eslint-config/base";
import react from "eslint-config/react-internal";
export default [base, react];
```

## Goals
- Consistent style
- Fast lint runs
- Minimal false positives

## Future
- Add import sorting preset
- Add stricter accessibility rules
