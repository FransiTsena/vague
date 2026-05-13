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

## Educational Penetration Testing Lab

This project includes intentional vulnerabilities for educational purposes (penetration testing training for kids).

### 1. Open Redirect (Callback Redirection)
- **Location**: `/login`
- **Vulnerability**: The `callbackUrl` query parameter is used for redirection after successful login without proper validation.
- **Exploit Sample**: `http://localhost:3000/login?callbackUrl=https://google.com`
- **Impact**: Attackers can craft malicious links that redirect users to phishing sites after they log in to the legitimate application.

### 2. Privilege Escalation (Broken Access Control)
- **Location**: `/api/members/[id]`
- **Vulnerability**: The `PATCH` endpoint for updating member information does not verify if the requester has administrative privileges before updating sensitive fields like `accessRole`.
- **Exploit Sample**: 
  From the browser console while logged in as a STAFF member:
  ```javascript
  const memberId = "YOUR_MEMBER_ID"; // Found in the UI or /api/members
  fetch(`/api/members/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessRole: 'ADMIN' })
  }).then(res => res.json()).then(console.log);
  ```
- **Impact**: A regular STAFF member can upgrade their own account (or others) to ADMIN, gaining full control over the system.

### 3. Stored XSS (Cross-Site Scripting)
- **Location**: `/provenance/[slug]`
- **Vulnerability**: The Provenance product page renders the product **Title** using `dangerouslySetInnerHTML`, allowing any HTML or JavaScript injected into the `title` field to be executed in the context of other users' browsers.
- **Exploit Sample**: 
  1. Create or edit a provenance product in the admin dashboard at `/admin/provenance`.
  2. Set the **Title** field to the following payload:
     ```html
     <img src=x onerror="alert('XSS triggered from Title field!')">
     ```
  3. View the generated product page.
  4. The script will execute, showing an alert box.
- **Impact**: Attackers can steal session cookies, perform actions on behalf of other users, or deface the website.
