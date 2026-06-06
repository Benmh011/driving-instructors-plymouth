# Driving Instructors Plymouth

A two-sided marketplace connecting **learners** and **driving instructors** across
Plymouth and South West Devon. This is the **first push**: a production-ready,
PWA-installable landing page with a working waitlist capture, ready to grow into
the full app.

Stack: **Next.js 15.5.19** (App Router) · **React 19** · **Tailwind CSS v4** ·
**Geist + Bricolage Grotesque** · deployed on **Vercel**, with **Neon Pro** ready
to wire in.

---

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

> The service worker only registers in production builds, so PWA install /
> offline behaviour is testable via `npm run build && npm start`, not `dev`.

---

## What's in this push

- **Landing page** (`app/page.tsx`) — hero, how-it-works, an interactive
  learner/instructor toggle, coverage areas, FAQ and waitlist, plus header/footer.
- **Waitlist capture** — role-aware form (`components/Waitlist.tsx`) posting to
  `app/api/waitlist/route.ts`. The route validates input and currently logs the
  signup; persistence + email are stubbed inline (see below).
- **PWA scaffolding** — `public/manifest.webmanifest`, `public/sw.js`,
  L-plate icons in `public/icons/` and `app/{icon,apple-icon}.png`,
  service-worker registration in `components/ServiceWorker.tsx`.
- **Design system** — tokens and the road-marking motif live in
  `app/globals.css` (Tailwind v4 `@theme`). Brand signal is L-plate red
  `#e11d2a`; accents are road-line amber `#f2b705` on warm paper / tarmac.

---

## Deploy to Vercel

1. `git init && git add . && git commit -m "First push: landing page"`
2. Create a new GitHub repo and push.
3. In Vercel: **New Project → import the repo**. No build settings needed —
   it autodetects Next.js.
4. Add the domain: in Vercel **Settings → Domains**, add
   `drivinginstructorsplymouth.com` (and `www.`), then point your registrar's
   nameservers / records at Vercel. `SITE` in `app/layout.tsx` is already set to
   the live domain.

There is **nothing to `git pull`** — this is a brand-new project, separate from
your `south-hams-reaction` / `reaction-landing` repos.

---

## Next push — wire the waitlist to Neon + Resend

The API route (`app/api/waitlist/route.ts`) has the full snippet inline. Summary:

1. **Neon (Pro):** create a `waitlist` table and insert on submit.

   ```sql
   create table if not exists waitlist (
     id         bigint generated always as identity primary key,
     email      text not null unique,
     role       text not null check (role in ('learner','instructor')),
     area       text,
     created_at timestamptz not null default now()
   );
   ```

   Add `DATABASE_URL` to Vercel env vars (see `.env.example`). Either
   `@neondatabase/serverless` (lightweight) or Prisma (matches your other repos).

2. **Resend:** send a confirmation email on signup. Add `RESEND_API_KEY` and
   `WAITLIST_FROM_EMAIL`.

3. **Instructor onboarding:** a separate flow once a learner base is forming —
   profiles, availability, pricing, coverage areas.

---

## Roadmap from landing page → PWA

- [ ] Persist waitlist (Neon) + confirmation emails (Resend)
- [ ] Auth (Auth.js v5, mirroring the Reaction stack) for learner + instructor accounts
- [ ] Instructor profiles, availability calendar, coverage areas
- [ ] Search & matching by postcode / area
- [ ] Booking + payments (deposits to cut no-shows)
- [ ] Push notifications via the existing service worker
