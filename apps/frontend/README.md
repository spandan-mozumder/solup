## Frontend (Next.js App Router)

User-facing web application for Solup providing authentication, dashboard, validator interaction, and theming.

## Features
- Next.js App Router (v15)
- Authentication via NextAuth (credentials + Google)
- Prisma-backed user/session persistence
- Shadcn UI + Tailwind theming (dark / light / system)
- Sonner toasts for feedback
- Solana wallet integration (validator runtime)
- Modular hooks: `useWebsites`, `useValidatorStats`, `useAuthenticatedAPI`

## Dev Quick Start
```bash
bun install
bun dev
# open http://localhost:3000
```

## Environment Variables (examples)
```
DATABASE_URL=postgres://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=changeme
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_API_BASE=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
```

## Structure Highlights
- `app/` route segments, API routes for auth & validator ops
- `components/` UI and providers (theme, auth, wallet)
- `hooks/` data + side-effect abstractions
- `lib/auth.ts` NextAuth configuration
- `types/next-auth.d.ts` module augmentation for session token `id`

## Scripts
```bash
bun dev          # development
bun run build    # production build
bun start        # start production server
```

## Testing Ideas (Not Implemented Yet)
- Component tests via Playwright / React Testing Library
- Contract tests for API endpoints

## Future Enhancements
- Suspense-based data loading
- Improved wallet abstraction & lazy hydration
- Analytics + audit logging

## Troubleshooting
- Build failing on wallet context: ensure wallet provider only loads client-side.
- Auth types missing: confirm `types/next-auth.d.ts` is picked up (tsconfig `typeRoots`).
