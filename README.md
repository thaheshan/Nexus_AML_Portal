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

## 📐 Architecture & Key Design Decisions

### 1. Feature-Based Directory Architecture (`src/features/`)
The application codebase is organized around domain-driven feature modules rather than technical layers:
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
*Rationale:* Keeps domain logic, components, and hooks localized to their feature boundary for maintainability and scalability.

### 2. High-Performance Redis Caching Layer (`src/lib/cache.ts`)
- **Transparent Read-Through Caching (`withCache`)**: API endpoints wrap expensive database queries with Redis TTL caching (`15s` – `60s` depending on data volatility).
- **Graceful Fallback**: If Redis is offline or unreachable, the caching layer transparently executes the underlying database fetcher without throwing errors or crashing.
- **Pattern-Based Cache Invalidation (`invalidateCache`)**: Write operations (`POST`, `PUT`, `DELETE`, `PATCH`) automatically invalidate matching cache keys (`cases:*`, `dashboard:*`, etc.) using Redis `SCAN` + `DEL`.

### 3. Production Security & Hardening
- **Rate Limiting (`src/lib/rateLimit.ts`)**: Brute-force protection on `/api/auth/login` enforcing maximum 5 login attempts per 60 seconds per IP, backed by Redis sliding window counters.
- **CSRF Token Validation (`src/lib/csrf.ts` & `middleware.ts`)**: Double-submit cookie CSRF validation for all API mutation requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- **Edge Runtime Security Compatibility**: Uses standard Web Crypto API (`crypto.getRandomValues`) for CSRF token generation, fully compatible with Next.js Edge Middleware.
- **HTTPS & Secure Cookies**: Mandatory HTTP-to-HTTPS 301 redirect in production, and `HttpOnly`, `SameSite`, and `Secure` cookie flags on JWT tokens.

### 4. Real-Time Dynamic Analytics
- **Dynamic 30-Day Case Volume Chart**: The dashboard chart dynamically aggregates real database cases over a 30-day window into 6 discrete time intervals, displaying live real-time trends for new vs. resolved compliance cases.

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
