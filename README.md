## Teme Website

This repository is a Next.js app with Mongo-powered APIs in [src/app/api](src/app/api).

The public gallery now reads live project data from Mongo through the in-app endpoint at /api/gallery/projects.

Demo content for rooms, bookings, analytics tables, and gallery projects can be seeded from /api/seed.

## Frontend setup

Create an env file in the project root:

- MONGODB_URI
- NEXT_PUBLIC_SUPABASE_URL (optional, only for admin auth)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (optional, only for admin auth)

Run frontend:

```bash
pnpm install
pnpm dev
```

Frontend URL: http://localhost:3000

Admin UI page: /admin/gallery

## Demo seed

With the app running, seed demo data:

```bash
node ai-seed-runner.js
```

Or call POST /api/seed directly with a JSON body.

After seeding, browse /gallery to view Mongo-backed demo projects.
