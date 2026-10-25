# Park it! — leaderboard

A live leaderboard for **Park it!**: every player gets 3 attempts, each attempt is 3 discs
thrown at the pin. A disc scores 1 point per cm from the pin (10 cm = 10 points), and
anything outside 3 m scores 300. An attempt scores the sum of its 3 discs, a player's score is
all 3 attempts added up, and the lowest total wins. Equal totals are split by the better single
attempt. A player is ranked once all 3 attempts are in; until then the board shows a running total.

The rules live in one place: [`park-it.rules.ts`](src/app/domains/competition/domain/park-it.rules.ts)
and [`scoring.ts`](src/app/domains/competition/domain/scoring.ts).

- **Leaderboard** at `/`: podium, standings, stats. Updates live.
- **Admin** at `/admin`: reached from the faint lock icon in the footer. Admins add, rename
  and remove players and enter each disc's distance.

## Stack

Angular 21 (standalone, zoneless, signals) · NgRx SignalStore · Firebase (Firestore + Auth) ·
Vitest · GitHub Pages.

> Angular 22 needs Node ≥ 24.15. This project uses Angular 21 so it runs on Node 24.11.
> To move to 22 later, upgrade Node and run `npx ng update @angular/core @angular/cli`.

## Architecture (DDD)

```
src/app/
├─ core/                       app-wide config and the Firebase app/Firestore instances
├─ shared/                     cross-context building blocks (toasts, icons, DomainError)
├─ layout/admin-layout/        admin shell that composes the two contexts
└─ domains/
   ├─ competition/             players, attempts, scoring, ranking
   │  ├─ domain/               pure model + rules + PlayerRepository port (no Angular)
   │  ├─ application/          PlayersStore (NgRx SignalStore)
   │  ├─ infrastructure/       Firestore adapter, local-storage demo adapter
   │  ├─ feature-leaderboard/  smart page: public leaderboard
   │  ├─ feature-manage/       smart page: admin player & score management
   │  └─ ui/                   dumb components (inputs/outputs only)
   └─ identity/                admin sign-in
      ├─ domain/               AdminSession, AuthGateway port
      ├─ application/          AuthStore, route guards
      ├─ infrastructure/       Firebase Auth adapter, demo adapter
      ├─ feature-login/        smart page
      └─ ui/                   dumb login form
```

- **Smart components** (`feature-*`) inject stores and pass data down.
- **Dumb components** (`ui/`) only use `input()` / `output()` and never touch a store.
- **Stores** hold state as signals and derive the leaderboard with `computed`; writes go
  through the repository/gateway ports, so swapping Firebase out only touches `infrastructure/`.
- The admin area and Firebase Auth are lazy-loaded; leaderboard viewers never download them.

## Run locally

```bash
npm install
npm start          # http://localhost:4200
npm test -- --watch=false
```

Without Firebase config the app runs in **demo mode**: a sample board is stored in your
browser's local storage, and the sign-in page offers a "Fill in demo admin" button.

## Connect Firebase

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Firestore Database → Create database** (production mode).
3. **Build → Authentication → Sign-in method →** enable **Email/Password**.
4. **Authentication → Users → Add user** for each admin. Copy the user's **UID**.
5. **Firestore → Start collection** `admins`, add a document whose **ID is that UID**
   (any field, e.g. `name: "Antonio"`). Only users listed here can change scores.
6. **Firestore → Rules**: paste [`firestore.rules`](firestore.rules) and publish
   (or `npx firebase-tools deploy --only firestore:rules --project <project-id>`).
7. **Project settings → Your apps → Add web app**, then copy [`.env.example`](.env.example) to
   `.env.local` and fill in the config values. `.env.local` is git-ignored;
   `npm start` / `npm run build` generate `src/environments/environment.ts` (also git-ignored) from it.
   These values end up in the browser anyway; the rules above are what protect the data.
8. **Authentication → Settings → Authorized domains →** add `<your-user>.github.io`.

Recommended: in **Authentication → Settings → User actions**, turn off **Enable create
(sign-up)** so nobody can create accounts through the API. Non-admin accounts cannot write
anyway, but this keeps the user list clean.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. **Settings → Secrets and variables → Actions → New repository secret**: add each variable from
   [`.env.example`](.env.example) (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
   `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`) with its value.
4. Every push to `main` (or `master`) runs [`deploy.yml`](.github/workflows/deploy.yml):
   tests, Firebase config from the secrets, build with the right base href for the repo, and publish.
   The build stops with a clear message if a secret is missing.

The site is served at `https://<your-user>.github.io/<repo>/`; the admin is at `…/<repo>/admin`.
