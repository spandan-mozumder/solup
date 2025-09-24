# DB Package

Centralized Prisma Client + schema for the monorepo.

## Key Files
- `prisma/schema.prisma` – data model (users, accounts, sessions, validators, etc.)
- `prisma/migrations/` – generated migration history
- `prisma/seed.ts` – development seed script
- `index.ts` – exports a singleton Prisma client (prevents hot-reload connection storms)

## Commands
Generate client after model changes:
```bash
cd packages/db
prisma generate
```

Create and apply a migration:
```bash
prisma migrate dev --name meaningful_change
```

Reset dev database:
```bash
prisma migrate reset --force
```

Seed (runs automatically on migrate reset if configured):
```bash
ts-node prisma/seed.ts
```

## Conventions
- Never instantiate a new `PrismaClient` directly in app code; import from this package.
- Prefer nullable columns over sentinel values.
- Use explicit relation names when more than one relation exists between two models.

## Roadmap
- Add soft-delete pattern (e.g. `deletedAt`)
- Introduce audit/event tables
- Add composite indexes for query hotspots
