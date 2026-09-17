# Next.js and Express Migration Design

## Goal

Replace the unfinished Blazor frontend and the ASP.NET Core backend with a TypeScript monorepo while preserving the deliverables of GitHub issues #21 through #25.

## Architecture

The repository uses a pnpm workspace with two independently deployable applications:

- `frontend`: Next.js App Router configured as a static export for Azure Static Web Apps.
- `backend`: Express REST API for Azure App Service, backed by Azure SQL through Prisma 7.

The browser reads `NEXT_PUBLIC_API_URL` and calls Express over HTTPS. Express is the only component that accesses the database. CORS accepts the configured frontend origin. Secrets remain in backend environment variables.

## Preserved Contracts

The migrated backend provides:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/access/customer`
- `GET /api/access/restaurant-owner`

Registration accepts `name`, `email`, `password`, and `role`. Roles normalize to `Customer` or `RestaurantOwner`; passwords are hashed; duplicate email returns `409`; invalid input returns `400`. Login returns the same response shape as the .NET API: `userId`, `name`, `email`, `role`, `token`, and `expiresAt`. Invalid credentials return one indistinguishable `401` response. Protected endpoints return `401` without a valid token and `403` for the wrong role.

## Database

Prisma models cover all entities from the existing ERD: User, Restaurant, Menu, ProductionRecord, SurplusListing, Cart, CartItem, Order, OrderItem, Pickup, and ProductionRecommendation. SQL Server table and column names remain compatible with the existing schema. The initial SQL migration includes the quantity, price, pickup-window, and uniqueness constraints previously enforced by Entity Framework.

Prisma stays on major version 7 because Prisma 8 does not yet support SQL Server. Production uses the Microsoft SQL Server driver adapter with encrypted Azure SQL connections.

## Frontend

The initial Next.js application provides unstyled placeholder routes at `/`, `/login`, and `/register`, matching issue #21. Product UI and authentication forms belong to later issues. Static export produces `frontend/out` for Azure Static Web Apps.

## Verification

- Backend request tests cover health, register/login, duplicate and invalid input, hidden password hashes, missing tokens, and both role combinations.
- Prisma schema validation and TypeScript compilation verify the database client boundary.
- Next.js lint and production build verify all routes and static export.
- GitHub Actions runs install, lint, test, Prisma generation/validation, and both builds with Node.js 24.

## Removed Stack

Delete the .NET projects, EF migrations, `.NET` tool manifest, and Blazor-specific design documents. Preserve diagrams, project context, and product documentation.
