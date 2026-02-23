⚠️ This project was developed with the assistance of Cursor.
However, the system architecture, design patterns, and implementation strategies
are based entirely on up-to-date industry best practices and were fully reviewed and supervised.


---

# Cursor Shop — Storefront & Admin Dashboard (Next.js 14 Monorepo)

Cursor Shop is a full-stack e-commerce system built with **Next.js 14 (App Router)**.  
This repository contains two independent but related applications:

- **`store/`** → Customer-facing e-commerce storefront  
- **`admin/`** → Admin dashboard for managing products, orders, and users  

Both applications use **TypeScript**, **Prisma ORM**, **PostgreSQL**, and **NextAuth**.

---

# 🏗 Architecture Overview

This is a monorepo containing two standalone Next.js applications.  
Each app:

- Has its own `package.json`
- Has its own `prisma/schema.prisma`
- Has its own environment variables
- Can be deployed independently
- Can use separate or shared databases

---

# 🚀 Tech Stack

### Core
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

### Authentication
- NextAuth (JWT / Session strategy)
- Google OAuth
- Credentials provider (email/password)

### Store-Specific
- Stripe Checkout + Webhooks
- Zustand (lightweight state management)
- next-pwa (Progressive Web App support)

### Admin-Specific
- Role-based access control (ADMIN / USER)
- Protected API routes
- Admin creation script

---

# 📂 Project Structure

```
admin/
  prisma/
  scripts/
  src/
    app/
      (admin)/
      api/
  middleware.ts
  package.json
  .env.example

store/
  prisma/
  public/
  src/
    app/
      (shop)/
      api/
  render.yaml
  package.json
  .env.example
```

---

# 🧩 Core Features

## 🛍 Store (store/)

- Product listing & category filtering
- Product details
- Cart & cart persistence
- Order creation & order history
- User authentication (Google + credentials)
- Stripe checkout integration
- Stripe webhook handling
- PWA support (offline page + service worker)
- Secure API routes
- Session-based authentication

---

## 🛠 Admin (admin/)

- Admin dashboard
- Product CRUD
- Category CRUD
- Order management
- Notification management
- Role-based access (ADMIN only)
- Middleware security headers (CSP, etc.)
- Admin creation script

---

# 🗄 Database Schema

Both apps use Prisma with PostgreSQL.

Main models include:

- `User` (with role: USER | ADMIN)
- `Account`
- `Session`
- `Category`
- `Product`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Review`
- `Notification`
- `Admin`

---

# 🧪 Local Development Setup

## Requirements

- Node.js 18+
- PostgreSQL
- npm (recommended)

You must run setup separately for each app.

---

# 🛍 Running the Store

```bash
cd store
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Default:
- Runs on: `http://localhost:3001`

Production:

```bash
npm run build
npm start
```

---

# 🛠 Running the Admin Dashboard

```bash
cd admin
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Default:
- Runs on: `http://localhost:3000`

Production:

```bash
npm run build
npm start
```

---

# 🔐 Environment Variables

Each app has its own `.env`.

## Common Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

NEXTAUTH_URL="http://localhost:3000"   # admin
# or
NEXTAUTH_URL="http://localhost:3001"   # store

NEXTAUTH_SECRET="a-very-long-random-string"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Store-Only Variables

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Optional (if Redis is configured):

```env
REDIS_URL="..."
```

---

# 👤 Creating an Admin User

Inside `admin/.env`:

```env
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="strongpassword"
ADMIN_NAME="Admin Name"
```

Then run:

```bash
cd admin
npm run create-admin
```

This creates or updates a user with the ADMIN role.

---

# 💳 Stripe Integration (Store)

Webhook endpoint:

```
/api/webhooks/stripe
```

To test locally:

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Copy the generated `whsec_...` value into:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

# 🔐 Authentication Flow

- NextAuth manages sessions and JWTs
- Google OAuth supported
- Email/password login supported
- Admin routes require `role === ADMIN`
- Middleware protects restricted routes

---

# 📡 API Routes Overview

## Store

- `/api/auth/*`
- `/api/cart`
- `/api/cart/count`
- `/api/webhooks/stripe`

## Admin

- `/api/products`
- `/api/categories`
- `/api/orders`
- `/api/notifications`
- `/api/upload`
- `/api/debug`

Most Admin endpoints require an authenticated ADMIN user.

---

# 🧰 Useful Prisma Commands

```bash
npx prisma studio
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
```

---

# 🏗 Deployment

## Option 1: Render (Store)
`store/render.yaml` contains a sample configuration.

## Option 2: VPS / Node Hosting

```bash
npm run build
npm start
```

Production recommendation:

```bash
npx prisma migrate deploy
```

---

# ⚠ Important Notes

- Ensure `NEXTAUTH_URL` matches the correct port.
- Use separate databases for admin and store in production.
- Keep `.env` files out of version control.
- Always back up your database before running production migrations.

---

# 🧪 Linting

Inside each app:

```bash
npm run lint
```

---

# 📄 License

MIT License
