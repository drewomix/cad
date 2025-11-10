# Sentinel CAD & RMS Suite

Sentinel is a production-ready, end-to-end Computer Aided Dispatch (CAD) and Records Management System (RMS) designed for FiveM public-safety roleplay communities. The platform delivers dispatcher, officer MDT, supervisor/admin, and citizen-facing experiences with real-time collaboration, approvals, and FiveM telemetry integration.

## Features

- **Citizen self-service portal** for identity and vehicle registration, online report intake, and submission tracking with approval workflow.
- **Dispatcher console** with tri-pane layout for call intake, incident board, live unit map, BOLO manager, and Socket.IO-powered real-time updates.
- **Officer MDT** supporting duty toggles, call management, quick status hotkeys, report drafting/submission, and supervisor approvals.
- **Supervisor/Admin suite** covering approval queues, user management, NCIC-style search, and comprehensive audit logging.
- **FiveM integration** via signed telemetry webhooks and public CAD status endpoints with feature flag control.
- **Printable PDF exports** for incident reports and citations with agency branding.
- **Role-based access control** enforced across API routes with audit logging for all CRUD and search operations.

## Monorepo Structure

```
apps/
  api/      NestJS + Prisma backend
  web/      React + Vite frontend (Tailwind + shadcn-inspired UI)
packages/
  shared/  Shared types, validation schemas, RBAC helpers
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+ (corepack recommended)
- Docker (optional but recommended for full stack)

### Installation

```bash
corepack enable pnpm
pnpm install
pnpm --filter @cad/shared build
pnpm --filter @cad/api prisma:generate
pnpm --filter @cad/api prisma:migrate
pnpm --filter @cad/api prisma:seed
```

Create a `.env` file from the provided [.env.sample](./.env.sample) and adjust values as needed.

### Development

Run API and Web in parallel:

```bash
pnpm --filter @cad/api dev
pnpm --filter @cad/web dev
```

The web application runs on `http://localhost:5173` and the API listens on `http://localhost:3333`.

### Docker Compose

Build and launch the full stack (PostgreSQL, API, Web) with:

```bash
docker-compose up --build
```

The dispatcher/MDT UI will be available at `http://localhost:4173`.

### Testing the Core Flow

1. **Citizen Flow** – Sign in with the seeded citizen account, create a person profile and vehicle. Supervisors can approve via the Admin queue, making the records searchable.
2. **Dispatch Flow** – Log in as dispatcher, create/assign incidents, and observe real-time map/unit updates.
3. **Officer Flow** – Officers toggle duty, update statuses, and submit reports for supervisor approval.
4. **BOLO Flow** – Create a BOLO via dispatcher/admin; officers receive hits inside the MDT search.
5. **FiveM Telemetry** – POST signed telemetry payloads to `/fivem/telemetry/unit-location` to update unit markers.

### Seed Accounts

All seeded accounts use the password `Password123!` by default:

| Role       | Email                     |
|------------|---------------------------|
| Admin      | `admin@cad.local`         |
| Supervisor | `supervisor@cad.local`    |
| Dispatcher | `dispatcher@cad.local`    |
| Officer    | `officer@cad.local`       |
| Records    | `records@cad.local`       |
| Citizen    | `citizen@cad.local`       |

## API Highlights

- JWT access/refresh tokens with CSRF toggle and rate-limited endpoints.
- Prisma schema models cover agencies, units, incidents, reports, arrests, warrants, BOLOs, evidence, and audit logs.
- Socket.IO namespace `/realtime` broadcasting unit, incident, dispatch, BOLO, and report events.
- PDF exports powered by `pdfkit` for print-ready artifacts.

## Frontend Highlights

- Vite + React + TypeScript with Tailwind and shadcn-style UI kit.
- React Query for data synchronization and optimistic UI updates.
- Zustand auth store with automatic token refresh handling.
- Leaflet-based dispatcher map with unit markers and telemetry trails.
- Dense, enterprise-inspired layouts optimized for keyboard workflows.

## Additional Resources

- [`apps/api/prisma/seed.ts`](apps/api/prisma/seed.ts) – Demo data seeding logic.
- [`apps/api/prisma/migrations`](apps/api/prisma/migrations) – Baseline database schema migration.
- [`apps/web/src/features`](apps/web/src/features) – Feature-specific UI modules for citizen, dispatch, MDT, and admin flows.
- [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) – Complete data model reference.

## Commands

| Command                                | Description                                      |
|----------------------------------------|--------------------------------------------------|
| `pnpm -w build`                        | Build shared package, API, and Web bundles       |
| `pnpm --filter @cad/api dev`           | Run API in watch mode                            |
| `pnpm --filter @cad/web dev`           | Run Web UI (Vite dev server)                     |
| `pnpm --filter @cad/api prisma:seed`   | Seed demo agencies, users, units, incidents, etc |
| `docker-compose up --build`            | Launch PostgreSQL + API + Web stack              |

## FiveM Integration

- Webhook endpoint: `POST /api/fivem/telemetry/unit-location`
  - Body: `{ callsign, lat, lng, heading?, speed? }`
  - Header: `x-signature` HMAC SHA-256 signature using `HMAC_SECRET`
- Public status endpoints:
  - `GET /api/fivem/public/current-calls`
  - `GET /api/fivem/public/unit-statuses`
- Toggle via `FEATURE_FIVEM=true|false` in environment variables.

## License

This project is provided as a reference implementation for advanced roleplay CAD/RMS workflows. Customize and extend to match your community's needs.
