# API Service

Backend service providing data + validator operations for the Solup platform.

## Responsibilities
- Website registration and status tracking
- Validator registration & message relay surfaces
- Shared persistence through Prisma (see `packages/db`)
- Acts as a thin layer the Next.js frontend calls via `/api/v1/*`

## Tech Stack
- Runtime: Bun
- Language: TypeScript
- ORM: Prisma (imported client)
- Logging: console (candidate for structured logging later)

## Local Development
```bash
bun install
bun run index.ts
```

## Environment
Requires the same database + auth related env vars used by the frontend (NextAuth / Prisma).

## Folder Notes
- `config.ts` runtime configuration helpers
- `utils/` utility helpers

## Future Enhancements
- Rate limiting
- Structured logging (pino)
- OpenAPI specification
