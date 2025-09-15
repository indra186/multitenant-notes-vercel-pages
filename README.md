# Multi-tenant Notes SaaS (Pages Router)

This project is a minimal multi-tenant Notes SaaS app (Next.js Pages Router) ready to deploy to Vercel.

## What's included
- Next.js frontend + API (Pages Router under `pages/api`)
- Prisma schema + seed script
- Pre-seeded tenants: Acme and Globex (password: `password` for test users)
- Postman collection to test endpoints

## Quick deploy guide (GitHub -> Vercel)
1. Create a GitHub repo and push the project.
2. Create a Postgres database (Supabase, Railway, Neon, etc.). Get the `DATABASE_URL`.
3. On Vercel, Import the GitHub repo (Framework: Next.js).
4. Add Environment Variables on Vercel:
   - `DATABASE_URL` = your Postgres connection string
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -hex 32`)
5. Deploy on Vercel.
6. After deploy, run migrations and seed against the production DB locally:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.js
   ```
7. Visit your Vercel URL (e.g. `https://<project>.vercel.app`) → login page.

## Test accounts (all password: password)
- admin@acme.test (Admin, Acme)
- user@acme.test (Member, Acme)
- admin@globex.test (Admin, Globex)
- user@globex.test (Member, Globex)

## API endpoints
- `GET /api/health` → { status: "ok" }
- `POST /api/auth/login` → { token }
- `GET /api/notes` → list tenant notes
- `POST /api/notes` → create note (Free plan limited to 3 notes)
- `GET /api/notes/:id` → get note
- `PUT /api/notes/:id` → update note
- `DELETE /api/notes/:id` → delete note
- `POST /api/tenants/:slug/upgrade` → upgrade tenant to PRO (Admin only)

