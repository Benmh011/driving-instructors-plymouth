# Driving Instructors Plymouth

A two-sided marketplace connecting **learners** and **driving instructors** across
Plymouth and South West Devon.

Stack: **Next.js 15.5.19** (App Router) · **React 19** · **Tailwind CSS v4** ·
**Auth.js v5** (email + password) · **Prisma** + **Neon Postgres (Pro)** ·
deployed on **Vercel**. PWA-installable.

---

## What's built

- **Marketing landing page** (`/`) — hero, how-it-works, learner/instructor toggle,
  coverage areas, FAQ. CTAs lead to sign-up.
- **Accounts** — email + password via Auth.js v5 (Credentials provider, JWT sessions).
  Register (`/register`), sign in (`/login`), sign out.
- **Role-based onboarding** (`/onboarding`) — learners and instructors fill
  different forms; data saved to Postgres, `onboardingComplete` flag set.
- **Dashboard** (`/dashboard`) — role-aware landing showing the saved profile.
- **Route protection** (`middleware.ts`) — signed-out users are sent to `/login`;
  onboarding completion is enforced server-side from the database.

Key files: `auth.ts` / `auth.config.ts` (Auth.js), `prisma/schema.prisma` (data model),
`lib/prisma.ts` (client), `app/(auth)/actions.ts` + `app/onboarding/actions.ts`
(server actions).

---

## First-time setup

You need a Neon database connected before this runs.

1. In the Neon console, copy **two** connection strings for your database:
   the **pooled** one (host contains `-pooler`) and the **direct** one (no `-pooler`).
2. Create a file named `.env.local` in the project root with:

   ```
   DATABASE_URL="<your pooled Neon string>"
   DIRECT_URL="<your direct Neon string>"
   AUTH_SECRET="<a long random secret>"
   ```

   Generate the secret with `npx auth secret` (it can write it for you) or
   `openssl rand -base64 33`.
3. Create the database tables:

   ```
   npx prisma migrate dev --name init
   ```

4. Run it:

   ```
   npm run dev
   ```

   Open http://localhost:3000, create an account, and you'll be taken through
   onboarding to the dashboard.

---

## Deploying to Vercel

The repo's already connected. To make auth + database work in production:

1. In Vercel → Project → **Settings → Environment Variables**, add the same three
   variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`.
2. The `postinstall` script runs `prisma generate` automatically on each build.
3. Because you ran `prisma migrate dev` against your Neon database in step 3 above,
   the tables already exist — production points at the same database, so it's ready.
   (For separate prod/preview databases later, run `npx prisma migrate deploy`.)
4. Redeploy.

---

## Roadmap

- [ ] Add Google sign-in (Auth.js OAuth provider + Prisma adapter)
- [ ] Instructor public profiles + availability calendar
- [ ] Learner search & matching by area / postcode
- [ ] Booking flow + payments (deposits to reduce no-shows)
- [ ] Email (Resend) for confirmations and notifications
