# HR Pilot

A practice HR SaaS app built with Next.js. One landing page, a simple login, and a dashboard with
four modules: **Leaves**, **Payroll**, **Claims**, and **Settings** - seeded with an admin account
and a 20-person software company.

## Tech stack

- **Next.js 16** (App Router) with TypeScript - a single app serving both the frontend and the
  backend (via Route Handlers under `app/api`).
- **Tailwind CSS** + **shadcn/ui** (built on Base UI) for the interface.
- **Prisma ORM + PostgreSQL** (`@prisma/adapter-pg`) for persistence.
- **bcryptjs** for password hashing and a simple DB-backed session cookie for auth (no third-party
  auth provider - this is intentionally simple since it's a practice project).

## Getting started

You need Node.js, pnpm and a local PostgreSQL server (e.g. `brew install postgresql@16`).
`DATABASE_URL` is the only environment variable (see `.env.example`).

```bash
createdb hr_pilot_vercel
echo "DATABASE_URL=\"postgresql://$(whoami)@localhost:5432/hr_pilot_vercel\"" > .env
pnpm install                 # also runs `prisma generate`
pnpm prisma migrate deploy   # applies prisma/migrations (use `pnpm prisma migrate dev` when changing the schema)
pnpm seed                    # admin + 20 employees + sample leave/claim/payroll data
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

> Re-running `pnpm seed` at any time will wipe and regenerate all data back to a clean demo
> state.

## Deploy on Vercel

1. Push this repo to GitHub and import it in Vercel. `vercel.json` sets the framework (Next.js),
   `pnpm install` and `pnpm build` (`prisma generate && next build`).
2. In the project's **Storage** tab, add a Postgres database from the Vercel Marketplace (e.g.
   Neon) and connect it to the project, or bring your own Postgres. Make sure the project has a
   `DATABASE_URL` environment variable pointing at it (on Neon, use the pooled connection string).
3. The build does not run migrations. Run them and the seed once against that database from
   your machine:

   ```bash
   DATABASE_URL="<production connection string>" pnpm prisma migrate deploy
   DATABASE_URL="<production connection string>" pnpm seed
   ```

4. Redeploy if the first deployment ran before the database was connected.

## Demo credentials

This app uses simple, practice-only authentication - there is no email verification, OAuth, or
password reset flow. Credentials are shown right on the login page too.

| Role     | Username     | Password      |
| -------- | ------------ | ------------- |
| Admin/HR | `admin`      | `admin`       |
| Employee | `ahmad.faiz` | `password123` |

All 20 seeded employees share the password `password123`, with usernames in `firstname.lastname`
format (e.g. `wei.jian`, `priya.sharma`, `farah.aziz` - see `prisma/seed.ts` for the full list).

## Modules

- **Leaves** - apply for annual/sick/unpaid leave, track your balance, and (as Admin) approve or
  reject requests from the whole team.
- **Payroll** - view your monthly payslips with a full breakdown of basic salary, allowances, and
  deductions. Admins can also view payroll for every employee.
- **Claims** - submit expense claims (food, travel, medical, other) and track their approval
  status. Admins approve or reject claims from the team.
- **Settings** - update your name/email and change your password.

Only the `ADMIN` role can approve or reject leave requests and claims; regular employees can only
manage their own.

## Project structure

```
app/
  page.tsx                 Landing page
  login/page.tsx           Login page
  dashboard/                Protected dashboard (layout + 4 module pages)
  api/                      Route handlers (auth, leaves, claims, payroll, settings)
components/                Shared UI (shadcn/ui primitives + feature components)
lib/                        Auth, Prisma client, formatting, and other shared helpers
prisma/
  schema.prisma             Data model
  seed.ts                   Seed script (admin + 20 employees + sample records)
proxy.ts                    Route protection for /dashboard/**
```

## Notes

- Route protection is a two-layer check: `proxy.ts` redirects to `/login` when there's no session
  cookie, and each dashboard page/API route re-validates the session and role server-side.
- The generated Prisma client (`app/generated/prisma`) and `.env` are gitignored; `pnpm install`
  regenerates the client and `.env.example` shows the one variable to set.
