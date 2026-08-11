# Nexus AML Portal

An Enterprise-Grade Multi-Tenant Anti-Money Laundering (AML) Compliance & Inventory Management Platform built with Next.js 14, TypeScript, Redux Toolkit, Prisma, PostgreSQL, and Redis.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.x` or later
- **Database**: PostgreSQL (or Supabase Postgres connection string)
- **Cache**: Redis server running locally or via remote URL (`redis://localhost:6379`)

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your connection details:

```bash
cp .env.example .env
```

Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_aml"
DIRECT_URL="postgresql://user:password@localhost:5432/nexus_aml"
JWT_SECRET="your-32-character-random-secret-key-here"
REDIS_URL="redis://localhost:6379"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Sync & Prisma Client Generation
```bash
npx prisma db push
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **State Management** | Redux Toolkit (RTK Query for client caching & sync) |
| **Database & ORM** | PostgreSQL + Prisma ORM |
| **Caching Layer** | Redis (`ioredis` with read-through transparent caching) |
| **Authentication** | JWT (`jose`), HTTP-Only Cookies, bcryptjs |
| **Styling** | Vanilla CSS / CSS Modules (Design System Design Tokens) |
| **PDF Generation** | `jspdf` + `jspdf-autotable` |

---

## 📐 Architecture & Key Technical Decisions (Why We Built It This Way)

### 1. Feature-Based Directory Architecture (`src/features/`)
I migrated the project from a single flat `src/screens/` folder into domain-driven feature modules under `src/features/`.

```
src/
├── features/
│   ├── auth/           # Login, Register, Password Reset, Splash
│   ├── dashboard/      # Layout wrapper, Dashboard Home Analytics
│   ├── cases/          # Case Management List, Details, Form
│   ├── alerts/         # AML Alert Monitoring
│   ├── announcements/  # Team Announcements & Modals
│   ├── reports/        # Regulatory PDF Export & Management
│   ├── deployments/    # Service Deployment Status Tracker
│   ├── milestones/     # Delivery Roadmap & Deliverables
│   └── settings/       # Account Preferences & Security Settings
├── components/common/  # Reusable Common UI Components
├── lib/                # Cache, Auth, Prisma, Redis, CSRF, Rate Limit
└── store/              # Redux Store & RTK Query Services
```

- **Why I made this choice:** In large enterprise portals, putting all UI screens in one giant folder makes it hard to locate assets and maintain clean separation of concerns. Grouping code by domain (like `cases`, `alerts`, `auth`) ensures components, styles, types, and logic live next to each other. It makes scaling the application straightforward for multi-developer teams.

---

### 2. High-Performance Redis Caching Layer (`src/lib/cache.ts`)
I introduced a custom read-through caching helper (`withCache`) and an invalidation helper (`invalidateCache`) built on top of `ioredis`.

- **Read-Through Caching (`withCache`)**: API endpoints wrap expensive database queries with TTL-based Redis caching (`15s` – `60s` depending on data volatility).
- **Graceful Fallback**: If Redis happens to go down or is unreachable in a local dev environment, the cache layer silently catches the error and fetches fresh data directly from PostgreSQL. The app never crashes.
- **Pattern-Based Cache Invalidation (`invalidateCache`)**: Any mutation (`POST`, `PUT`, `DELETE`, `PATCH`) automatically purges matching cache keys using Redis `SCAN` + `DEL` patterns (e.g., `cases:*`, `dashboard:*`).
- **Why I made this choice:** Database reads for dashboard summaries, active case lists, and alert feeds are frequent. Hitting PostgreSQL on every single request slows down response times. Redis caching reduces latency to under ~5ms while automatic invalidation guarantees users never view stale compliance data after performing updates.

---

### 3. Production Security & Hardening

#### A. Rate Limiting on Login (`src/lib/rateLimit.ts`)
- Implemented sliding-window rate limiting on `/api/auth/login` allowing maximum **5 login attempts per 60 seconds per IP**.
- **Why I made this choice:** Prevents brute-force credential stuffing attacks against user accounts. I combined Redis counters with a fallback in-memory Map so rate limiting works seamlessly everywhere.

#### B. CSRF Protection (`src/lib/csrf.ts` & `middleware.ts`)
- Added double-submit cookie CSRF validation for all API mutation routes (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Why I made this choice:** Browsers automatically attach HTTP-Only authentication cookies on requests. Validating an explicit `x-csrf-token` header generated per-session blocks cross-site request forgery attacks.

#### C. Edge Runtime Security Compatibility
- Replaced Node.js native `crypto` module calls in middleware with standard Web Crypto API (`crypto.getRandomValues`).
- **Why I made this choice:** Next.js Edge Middleware runs in an isolated V8 environment that does not support Node.js built-in modules like `crypto`. Web Crypto API ensures 100% compatibility across Vercel Edge networks and local Node servers.

#### D. HTTPS & Secure Cookie Enforcement
- Configured production middleware to issue HTTP `301` redirects for non-HTTPS requests and attached `HttpOnly`, `SameSite=Lax/Strict`, and `Secure` flags to all authentication cookies.
- **Why I made this choice:** Protects session tokens from eavesdropping over unencrypted networks and prevents client-side JavaScript access (XSS token theft).

---

### 4. Dynamic 30-Day Real Data Analytics (`app/api/dashboard/route.ts` & `CaseVolumeChart.tsx`)
I overhauled the dashboard **Case Volume (30 Days)** SVG graph to fetch and compute real database records.

- **Dynamic Data Aggregation**: Queries cases created or updated within the last 30 days and aggregates them into **6 evenly-spaced date buckets** for both *New Cases* and *Resolved Cases*.
- **Interactive SVG Line Chart**: Rendered SVG curves with visual headroom, dynamic Y-axis tick marks, and custom crosshair tooltips.
- **Why I made this choice:** Hardcoded static chart points do not reflect actual team activity. Aggregating live database records into date buckets provides compliance officers with accurate real-time operational insights.

---

### 5. Build & Vercel Deployment Optimization

#### A. Prisma Client Auto-Generation (`package.json`)
- Updated the build script to `"build": "prisma generate && next build"`.
- **Why I made this choice:** Vercel caches build dependencies across deployments. Running `prisma generate` prior to `next build` guarantees that generated Prisma Client models are up to date and match the schema.

#### B. Force Dynamic API Route Configuration (`export const dynamic = 'force-dynamic'`)
- Added `force-dynamic` markers to `/api/dashboard`, `/api/search`, `/api/notifications`, `/api/users`, `/api/cases/[id]`, `/api/alerts/[id]`, etc.
- **Why I made this choice:** Next.js attempts to statically prerender API routes during `npm run build`. Routes that read cookies or headers require dynamic server evaluation. Marking them explicitly prevents `DynamicServerError` during static page collection on Vercel.

---

## 🔐 User Roles & Permissions

- **ADMIN**: Full management access across all modules (Cases, Alerts, Reports, Announcements, Users).
- **DEVELOPER**: Technical operational access including Deployment Status tracking.
- **CLIENT**: Project milestone tracking and overview visibility.
- **VIEWER**: Read-only compliance portal access.

---

## 📜 Git Commit History Summary

- `refactor: migrate screens to feature-based architecture + Redis caching layer`
- `fix(prod): production readiness, security hardening, real-data chart, and build fixes`
- `docs: add comprehensive production README with setup steps, architecture decisions, and security overview`
- `fix(vercel): trigger prisma generate on build and mark dynamic API routes as force-dynamic`
