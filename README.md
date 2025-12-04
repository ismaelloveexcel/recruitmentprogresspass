# Baynunah Recruitment Pass

Modern control tower for monitoring recruitment passes, panel progress, and SLA risk.

## Highlights

- **Full-stack TypeScript** with a typed contract shared between the Express + tRPC API and the React client.
- **In-memory data store** that simulates real-world passes, interviews, and feedback so the experience stays interactive without a database.
- **Performance-aware UI** powered by TanStack Query, HTTP batching, and lightweight Tailwind v4 styling.
- **Actionable UX**: inline status updates, quick feedback composer, risk badges, and live operational insights for admins.

## Getting Started

```bash
pnpm install          # install dependencies
pnpm dev              # start Vite client + API in parallel
```

Open <http://localhost:5173> to browse the client while the API streams data from <http://localhost:4173> via `/trpc`.

### Production build

```bash
pnpm build            # bundles Vite client and server
pnpm start            # serves dist/index.js and dist/public assets
```

### Useful scripts

| Command      | Description                                |
| ------------ | ------------------------------------------ |
| `pnpm check` | Type-checks shared, server, and client code |
| `pnpm test`  | Placeholder for Vitest (none yet)           |
| `pnpm format`| Applies Prettier across the repo            |

## Architecture

| Layer  | Stack                                                   |
| ------ | ------------------------------------------------------- |
| Client | React 19, Vite, Tailwind v4, TanStack Query, Sonner     |
| API    | Express, tRPC v11, SuperJSON, Zod                       |
| Shared | Co-located types/schemas for strict end-to-end typing   |
| Styling| Tailwind utilities w/ glassmorphism + responsive layout |

### Efficiency & UX wins

1. **Typed router + shared schemas** keep payloads small and validated without runtime casting.
2. **Batched tRPC link + React Query caching** remove redundant fetches while keeping UX snappy.
3. **Composable cards & filters** allow admins to triage passes, inspect health, and submit feedback without page reloads.
4. **Operational insights** surface SLA risk, offer velocity, and panel load for better forecasting.

## Environment

| Variable        | Purpose                             | Default                   |
| --------------- | ----------------------------------- | ------------------------- |
| `PORT`          | Server port                         | `4173`                    |
| `VITE_API_BASE` | Override API origin in the browser  | falls back to same origin |

## Testing & linting

- `pnpm check` validates all TypeScript eagerly.
- `pnpm test` is wired for future Vitest suites.

## Deployment

This application can be deployed to various platforms and hosting providers. See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for comprehensive deployment instructions including:

- **Environment Configuration** - Required environment variables
- **Docker Deployment** - Containerized deployment with Docker and Docker Compose
- **Platform-Specific Guides** - Step-by-step instructions for:
  - Railway
  - Render
  - DigitalOcean App Platform
  - AWS (EC2/ECS)
  - VPS/Dedicated Servers
- **Database Setup** - MySQL configuration and migrations
- **SSL/HTTPS Setup** - Security best practices
- **Monitoring & Scaling** - Production maintenance

### Quick Start Deployment Options

#### Using Docker Compose (Recommended for local/testing)
```bash
# Clone and navigate to the repository
git clone <your-repo-url>
cd recruitmentprogresspass

# Start the application with MySQL database
docker-compose up -d

# Access at http://localhost:4173
```

#### Using Railway (Fastest cloud deployment)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Using a VPS Server
```bash
# Run the automated deployment script (Ubuntu/Debian)
sudo bash deployment/deploy.sh
```

For detailed instructions, troubleshooting, and platform-specific configurations, please refer to **[DEPLOYMENT.md](./DEPLOYMENT.md)**.