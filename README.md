# Makita Bush Chopyard

Restaurant ordering system. Stack: Next.js (App Router) + TypeScript + Tailwind + Firebase (Auth + Firestore + Storage). Design source of truth lives in Figma; `design/design-tokens.md` mirrors it in code.

## Setup

1. Unzip this into your local `projects` folder and open in VS Code.
2. `npm install`
3. Create a Firebase project at https://console.firebase.google.com
   - Enable **Authentication** → Email/Password and Google sign-in methods.
   - Enable **Firestore Database** (start in production mode — rules are already in `firestore.rules`).
   - Enable **Storage**.
   - Under Project Settings → General, register a Web App and copy the config into `.env.local` (copy `.env.local.example` first).
   - Under Project Settings → Service Accounts, generate a private key (JSON) and fill the `FIREBASE_ADMIN_*` vars in `.env.local`. Keep the raw `\n` line breaks in the private key string, in quotes.
4. Install the Firebase CLI (`npm i -g firebase-tools`), run `firebase login`, then `firebase use --add` to link this folder to your Firebase project.
5. Deploy Firestore rules: `firebase deploy --only firestore:rules`
6. (Optional) Seed sample menu data: `npm run seed`
7. `npm run dev` — app runs at http://localhost:3000

## What's scaffolded (Phase 1: Auth)

- `/login`, `/register` — email/password + Google sign-in, via `src/lib/auth/AuthContext.tsx`
- `/admin` — role-protected route, gated client-side by `<RequireRole>` and at the edge by `src/middleware.ts`
- `firestore.rules` — the real enforcement boundary: customer/staff/admin roles, no client-side bypass possible
- `src/types/index.ts` + `src/lib/firebase/collections.ts` — typed Firestore collections: `users`, `categories`, `menuItems`, `modifierGroups`, `orders`
- Order line items snapshot price + modifier choices at order time (see `OrderLineItem` type) — orders never recompute totals from the live menu, per the original engineering spec.

## Next up (Phase 3+)

Menu browsing UI, cart (Zustand), checkout flow, and admin CRUD are not built yet — this scaffold covers foundation + auth only, per your phased build order. Deploy frontend to Vercel; Firebase services stay on Firebase's infra.
