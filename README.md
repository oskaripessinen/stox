# Stox

Stox is a modern stock market tracking application consisting of a Next.js frontend and a Node.js/Express backend. It provides real-time stock data, watchlists, news integration, and portfolio tracking capabilities.

## Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **State Management & Data Fetching:** React Server Components, Client Hooks

### Backend
- **Runtime:** Node.js
- **Language:** TypeScript
- **Database:** PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Caching:** Valkey (Redis compatible)
- **External APIs:**
  - Alpaca Markets (Market Data)
  - Finnhub (News/Sentiment)
  - Yahoo Finance (Historical Data backup)

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Cloud:** AWS ECS (Fargate)
- **CI/CD:** GitHub Actions

## Project Structure

```
/
├── backend/            # Express API & Worker service
│   ├── prisma/         # Database schema & migrations
│   ├── src/
│   │   ├── lib/        # API clients (Alpaca, Finnhub, etc.)
│   │   ├── routes/     # API Endpoints
│   │   └── index.ts    # Entry point
│   └── task-definition.json # AWS ECS Task Definition
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities
└── docker-compose.yml  # Local development orchestration
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (or use the one provided in docker-compose)

### 1. Installation

Install dependencies for both frontend and backend.

```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories.

**backend/.env**
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/stox?schema=public"

# Caching (Optional - defaults to localhost:6379)
VALKEY_HOST=localhost
VALKEY_PORT=6379

# Authentication
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...

# External APIs
ALPACA_API_KEY=...
ALPACA_API_SECRET=...
FINNHUB_API_KEY=...
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### 3. Database Migration

Initialize the database schema.

```bash
cd backend
npx prisma migrate dev
```

### 4. Running Locally

You can run the full stack using Docker Compose (recommended for full env simulation) or npm scripts.

**Using Docker Compose:**
```bash
docker-compose up --build
```

**Manually:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

Terminal 3 (Services - DB & Cache):
If not using full docker-compose, ensure you have a Postgres DB and Valkey/Redis instance running locally.

## Deployment

The project is configured for deployment on AWS ECS Fargate.
- **Backend:** Runs as a task containing the API container and a sidecar Valkey container for caching.
- **Frontend:** Can be deployed to Vercel or containerized on AWS.
- **Workflows:** GitHub Actions are located in `.github/workflows/` for automated building and pushing.
