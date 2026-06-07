# Guess the Number

A mobile-first number-guessing game with two modes:

**Single player** — pick a length (3–6 digits) and a difficulty (Easy / Normal /
Hard / Nightmare), and crack the system's secret number. Tracks guesses, time,
and your personal best, with an optional range tracker and hints. Practice
unlimited rounds (Play again / Change settings / Return to menu).

**Multiplayer** — two players join the same room, each picks a secret number,
then take turns guessing the other's. After every guess the **server** answers
`HIGHER / ВИЩЕ`, `LOWER / НИЖЧЕ`, or `CORRECT / ПРАВИЛЬНО`. The winner sees a
full-screen green **YOU WIN / ТИ ВИГРАВ**, the loser a red **YOU LOSE / ТИ
ПРОГРАВ**. The opponent's secret and exact guesses are **impossible to discover**
from the browser, network, or dev tools.

Effortless on phones: open the menu → Single player (instant) or Multiplayer
(create a room, share the link/QR, both players are in). No login, no install.

Stack: **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Supabase
(Postgres + Realtime + RLS + RPC)**. `qrcode` for invite QR codes.

## Game modes & features

- **Main menu:** Single player · Multiplayer · Statistics · Settings.
- **Single-player difficulties:** Easy (tracker + hints), Normal (tracker), Hard
  (nothing), Nightmare (no tracker/hints and stats hidden until you win).
- **Statistics** (per device, localStorage): games, wins, losses, win rate,
  average guesses, fastest win, longest game, best streak.
- **Range tracker:** after each result, shows the remaining possible range
  (e.g. guess `3000` → `HIGHER` → range `3001–9999`). Optional per difficulty /
  per room.
- **Hints** (optional): upper/lower half, odd/even, or first digit — computed on
  the server for multiplayer so the secret is never exposed.
- **Multiplayer room settings (host):** number length, turn timer
  (∞ / 15 / 30 / 60s), and toggles for random secret, hidden random, hints, and
  range tracker.
- **Random secret:** "Generate & show me" or "Generate & keep hidden" (play
  blind; the server stores it, you never see it, opponent never sees it).
- **Invite:** shareable link, copy, native share sheet, and a **QR code** to
  scan — no account needed to join.
- **Private play:** you see only your own guesses/results/secret; the opponent's
  activity is masked ("Guess #2 submitted", "thinking…").
- **Mobile-native:** full-screen, large touch targets, one-handed, safe-area
  aware, portrait + landscape, phones + tablets.

---

## How it stays cheat-proof

The whole game is designed around one rule: **the secret number never leaves the
database.**

- Secrets are stored in their own table, `player_secrets`, which has Row Level
  Security **enabled with no policies** — so no client (anon or signed-in) can
  ever `SELECT` it through the API.
- That table is **deliberately excluded from the Realtime publication**, so a
  secret is never broadcast to subscribers.
- Guesses are evaluated by a `SECURITY DEFINER` Postgres function
  (`make_guess`). It reads the opponent's secret *inside the database* only to
  compare it, and returns just `higher` / `lower` / `correct`. The raw value is
  never returned, logged, or sent over the wire.
- Clients **cannot write** to `rooms`, `players`, or `guesses` directly (no
  insert/update policies). Every state change goes through audited RPC functions
  that enforce turn order, 5-digit validation, and room state **server-side**.
- The browser only ever holds: room code, player names, turn, and guess history
  with results. There is no `secret` field anywhere in the client types, state,
  storage, or API responses. Open dev tools and inspect all you want — it isn't
  there.

---

## Project structure

```
.
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local.example          # copy to .env.local and fill in
├── supabase/
│   ├── schema.sql              # tables, RLS, realtime, and all game RPCs
│   └── test/
│       └── game-logic.test.mjs # automated full-game + anti-cheat test
└── src/
    ├── app/
    │   ├── layout.tsx          # root layout + mobile viewport
    │   ├── globals.css
    │   ├── page.tsx            # lobby: create / join room
    │   └── room/[code]/page.tsx
    ├── components/
    │   ├── DigitInput.tsx      # mobile-friendly 5-digit entry (with masking)
    │   ├── GuessHistory.tsx
    │   ├── RoomHeader.tsx      # room code, share, online indicators
    │   ├── RoomView.tsx        # all game phases (wait/setup/play/finished)
    │   └── ui.tsx              # buttons, cards, inputs
    └── lib/
        ├── supabaseClient.ts   # browser client + anonymous auth
        ├── types.ts            # NB: no `secret` field exists anywhere
        └── useGame.ts          # realtime sync + presence + RPC actions
```

---

## Setup (about 5 minutes)

### 1. Create a Supabase project

Go to <https://supabase.com>, create a free project, and wait for it to finish
provisioning.

### 2. Load the database schema

In the Supabase dashboard open **SQL Editor → New query**, paste the entire
contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
This creates all tables, security policies, realtime config, and game functions.

### 3. Enable anonymous sign-in

Each device gets an anonymous identity (used by the DB to enforce turns and hide
secrets). In the dashboard go to **Authentication → Sign In / Providers** and
enable **Anonymous sign-ins**.

### 4. Add your environment variables

Copy the example file and fill in your project's values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Find both under **Project Settings → API**. The **anon public** key is safe to
expose in the browser — all protection is enforced by RLS and the SECURITY
DEFINER functions. **Never** use the `service_role` key in this app.

### 5. Install and run

> If you cloned this with a `node_modules` folder already present, delete it
> first — prebuilt binaries are platform-specific:
> `rm -rf node_modules .next && npm install`

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. To test two players locally, open a second tab in
a **private/incognito window** (so it gets its own anonymous identity), or use
two devices.

---

## How to play

1. Player 1 enters a name and taps **Create a room**, then taps **Share / Copy**
   (uses the native share sheet on phones) to send the link.
2. Player 2 opens the link on their phone, confirms their name, and taps **Join
   room** — one tap, no code typing, no login.
3. Player 1 chooses the **number length** (3, 4, 5, or 6 digits). Both players
   use that same length for the round.
4. Each player privately picks their **secret number** (the entry is masked) and
   taps **Lock in my number**.
5. The game starts automatically. Players alternate guessing; the server replies
   `ВИЩЕ`, `НИЖЧЕ`, or `ПРАВИЛЬНО` after each guess, and the full guess history
   is shown.
6. The first correct guess ends the game instantly for both players. The winner
   gets a green **ТИ ВИГРАВ** screen, the loser a red **ТИ ПРОГРАВ** screen, both
   showing who won (Player 1 or Player 2) and the attempt count.
7. The big **RESET** button starts a fresh round with the same two players in the
   same room (clears secrets, guesses, and result). **New game** leaves the room.

---

## Deploy to production (Vercel)

1. Push this folder to a GitHub repository.
2. At <https://vercel.com> click **Add New → Project** and import the repo.
   Vercel auto-detects Next.js — no build settings needed.
3. Under **Environment Variables**, add the same two keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. You'll get a public HTTPS URL (e.g.
   `https://your-app.vercel.app`) that two people can open on separate phones and
   play immediately.

No Supabase changes are needed for production — the same project works for both
local dev and the deployed site. (Anonymous auth and Realtime are already on.)

## Deploy to production (Netlify)

1. Push this folder to a GitHub repository.
2. At <https://app.netlify.com> click **Add new site → Import an existing
   project** and pick the repo. Netlify auto-detects Next.js via its Next runtime
   (build command `next build`).
3. Under **Site configuration → Environment variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy site.** You'll get a public HTTPS URL to share.

Cloudflare Pages or any Next.js-capable host works the same way — just provide
the two env vars. (This project is **live on Vercel** already.)

---

## Reliability & UX details

- **Real-time sync** via Supabase Realtime (Postgres changes on
  `rooms`/`players`/`guesses`). Both devices update instantly.
- **Online/offline indicators** via Realtime Presence.
- **Disconnect & reconnect:** the anonymous session persists, so reloading or
  losing signal and coming back re-attaches you to the same room and player. The
  app also re-pulls state on tab focus and when connectivity returns. If an
  opponent leaves mid-game, the room returns to a safe state.
- **Mobile-first, responsive** layout tuned for iPhone and Android, with large
  tap targets, numeric keyboards, masked secret entry, and `100svh` handling for
  mobile browser toolbars.
- **Turn tracking, full guess history, rematch, and new game** are all built in.

---

## Testing

The game logic and the anti-cheat guarantee are covered by an automated test
that runs the **real** `supabase/schema.sql` against a throwaway local Postgres
and plays a full game:

```bash
npm install --no-save embedded-postgres pg
node supabase/test/game-logic.test.mjs
```

It asserts 32 checks, including: create/join → setup, host-only digit-length
selection (3–6) with validation, both-submit → play, host-moves-first, turn
enforcement, the `ВИЩЕ/НИЖЧЕ/ПРАВИЛЬНО` comparison logic (covering the spec
example secret `4544`), win detection + attempt count, **the opponent's secret
being unreadable by a client role (permission denied)**, RESET clearing all
state while preserving the chosen length, and correct leading-zero handling.

This project has also been verified with `npm run typecheck` and a clean
`npm run build`.

> **Live two-phone test:** because the realtime backend is your own Supabase
> project, the on-device flow runs against your deployed URL. After the deploy
> step, open the link on two phones (iPhone Safari + Android Chrome), create →
> share → join → set length → submit → guess → win/loss → RESET. All of that
> logic is the same code proven by the automated DB test above.

## Tech notes

- `npm run typecheck` — type-checks the whole project.
- `npm run build` — production build.
- All secrets compared as integers in the DB, so leading zeros (e.g. `01234`)
  are handled correctly for the higher/lower logic.
