# 🛒 Grabkart

Grabkart is a full-stack e-commerce application with product browsing, a shopping cart, checkout and payments, order tracking, and **live chat + video calling for order support** — all built on a modern TypeScript/React stack and shipped as a single Docker image.

> Live chat and video support for orders is the standout feature: customers can message or video call support directly from an order's detail page, powered by Stream.

---

## ✨ Features

- **Product catalog** — browse products by category, view product details by slug
- **Cart & checkout** — client-side cart (Zustand) with a server-validated checkout flow via [Polar](https://polar.sh) for payments
- **Order management** — order history, order status tracking (`pending` → `paid` / `failed`), and order summaries
- **Live order support** — in-app chat and video calls per order using Stream Chat & Stream Video
- **Authentication & roles** — Clerk-based auth with three roles: `customer`, `support`, and `admin`, enforced on the backend
- **Admin dashboard** — create, update, and delete products, with image uploads handled through ImageKit
- **Webhooks** — Clerk (user sync) and Polar (payment/order events) webhooks keep the database in sync with external providers
- **Error monitoring** — Sentry integrated on both frontend and backend
- **Keep-alive cron job** — pings the app's own health endpoint every 14 minutes to prevent cold starts on free-tier hosting
- **Single-container deployment** — a multi-stage Dockerfile builds the React app and the API into one deployable image

---

## 🧱 Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS 4 + daisyUI
- React Router
- TanStack Query (server state)
- Zustand (cart state)
- Clerk (auth)
- Stream Chat React & Stream Video React SDK
- Sentry (error tracking)

**Backend**
- Node.js + Express 5 (TypeScript)
- PostgreSQL + Drizzle ORM
- Clerk (auth middleware + webhooks)
- Polar (checkout & payment webhooks)
- Stream Chat (chat & video tokens)
- ImageKit (image storage/uploads)
- Zod (env & request validation)
- Sentry (error tracking)
- `cron` (scheduled health pings)

**Infra**
- Docker (multi-stage build: Vite build → TypeScript build → slim runtime image)
- Designed for single-service deployment (e.g. Render) — Express serves the built frontend as static files alongside the API

---

## 🗂️ Project Structure

```
Grabkart/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers (products, orders, checkout, admin, stream)
│   │   ├── routes/          # Express routers, mounted under /api
│   │   ├── db/              # Drizzle schema & DB client
│   │   ├── lib/             # env validation, roles, Stream/Polar/ImageKit clients, cron
│   │   ├── middleware/      # Sentry <-> Clerk user context
│   │   ├── webhooks/        # Clerk & Polar webhook handlers
│   │   └── index.ts         # App entrypoint
│   ├── scripts/seed.ts      # DB seed script
│   └── drizzle.config.ts
│
├── frontend/Grabkart/
│   ├── src/
│   │   ├── pages/           # Route-level pages (Home, Cart, Orders, Admin, etc.)
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Page-specific data hooks (TanStack Query)
│   │   ├── store/           # Zustand cart store
│   │   └── lib/             # API client, ImageKit upload/URL helpers
│   └── vite.config.js
│
└── Dockerfile                # Multi-stage build: frontend + backend → single image
```

---

## 🔌 API Overview

All backend routes are mounted under `/api`:

| Route | Description |
|---|---|
| `GET /api/products`, `/api/products/categories`, `/api/products/:slug` | Public product catalog |
| `GET /api/me` | Current authenticated user's profile |
| `POST /api/checkout` | Validates cart contents and creates a Polar checkout session |
| `GET /api/orders` | Authenticated user's orders |
| `GET /api/stream/token` | Issues a Stream chat/video token for the signed-in user |
| `/api/admin/*` (`products`, `imagekit/auth`) | Admin-only: manage products & get signed ImageKit upload credentials |
| `POST /webhook/clerk`, `POST /webhook/polar` | Webhook receivers for user sync and payment events |
| `GET /health` | Health check (used by the keep-alive cron job) |

Access control is role-based (`customer` / `support` / `admin`), enforced in middleware/controllers on the backend rather than trusted from the client.

---

## 🗄️ Data Model

Defined with Drizzle ORM (PostgreSQL):

- **users** — synced from Clerk, holds app role (`customer` / `support` / `admin`)
- **products** — catalog items (price in cents, category, image, active flag)
- **checkoutSessions** — snapshot of cart lines and total sent to Polar at checkout time
- **orders** — one per completed/attempted checkout, with status and totals
- **orderItems** — line items linking an order to the products purchased

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- A PostgreSQL database
- API keys/accounts for: [Clerk](https://clerk.com), [Polar](https://polar.sh), [Stream](https://getstream.io), [ImageKit](https://imagekit.io), and (optionally) [Sentry](https://sentry.io)

### 1. Clone the repo
```bash
git clone https://github.com/arindamm04/Grabkart.git
cd Grabkart
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#-environment-variables) below), then:

```bash
npm run db:push    # push the Drizzle schema to your database
npm run db:seed    # optional: seed sample products
npm run dev         # start the API in watch mode
```

### 3. Frontend setup
```bash
cd frontend/Grabkart
npm install
npm run dev
```

The frontend expects the API to be reachable — configure `VITE_API_URL` and `VITE_CLERK_PUBLISHABLE_KEY` as needed for local development (see the frontend's own `README.md` for Vite-specific defaults).

### 4. Run with Docker (production-style, single container)
```bash
docker build \
  --build-arg VITE_CLERK_PUBLISHABLE_KEY=your_key \
  -t grabkart .
docker run -p 3001:3001 --env-file backend/.env grabkart
```
This builds the frontend into static assets and serves them from the same Express server that powers the API — a single container, single port.

---

## 🔐 Environment Variables

Backend environment variables (validated with Zod at startup — the app will refuse to start if any required variable is missing or malformed):

```env
NODE_ENV=
PORT=

DATABASE_URL=

CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

FRONTEND_URL=

POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_API_BASE=
POLAR_CHECKOUT_PRODUCT_ID=

STREAM_API_KEY=
STREAM_API_SECRET=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

SENTRY_DSN=
```

*(Values intentionally left blank — fill these in with your own credentials.)*

---

