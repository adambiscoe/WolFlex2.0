# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands
- `npm start` (expo start); `npm run android` / `npm run ios` (expo run:*, needs native build); `npm run web`
- `npm run lint` (expo lint). No test runner is configured.
- Typecheck: `npx tsc --noEmit` (strict mode)
- Primarily tested on a physical iOS device via Expo Go.
- Setup: copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `src/lib/supabase.ts` throws at import if missing. Restart the dev server after changing them.

## Architecture
Expo 57 / React Native 0.86 / React 19 app using Expo Router (file-based, `src/app`), NativeWind 4 (Tailwind 3; `global.css`, `tailwind.config.js`) and Supabase for auth, Postgres and storage. Path alias `@/*` -> `src/*`.

**Routing and auth gating** (`src/app/_layout.tsx`): provider stack is KeyboardProvider > AuthProvider > WorkoutProvider. The root Stack uses `Stack.Protected` guards driven by `useAuth()`:
- no session -> `(auth)` (SignIn/SignUp)
- session and `isOnboarded === false` -> `SignUpInfo`
- session -> `(tabs)`, `Settings`, `WorkoutHistory`, `WorkoutDetail/[id]`

The splash screen stays up until fonts, assets, the auth session and (when signed in) the onboarding status have resolved. New signed-in screens must be registered under the session guard.

**State**: `src/providers/auth-provider.tsx` wraps the Supabase session and reads `users.onboarding_complete`. `src/providers/workout-provider.tsx` holds the in-progress workout (exercises, sets, elapsed timer) in memory only.

**Data layer** (`src/lib/*`): thin Supabase wrappers that return `{ data, error: string | null }` rather than throwing.
- `workout-history.ts` saves via the `save_workout` Postgres RPC and reads past workouts.
- `avatar.ts` uploads to the `avatars` storage bucket and updates `users.image`.
- `posts.ts` is the social feed (`posts` joined to `users`).

**Backend** (`supabase/`): `config.toml` plus the Deno edge function `functions/import-exercises`, which imports exercises from the wger API. The folder is excluded from `tsconfig`. Table and RPC schemas are not in the repo; they live in the Supabase project.

**Tabs** (`src/app/(tabs)`): Home, Search, Exercise, Diet, Social share a custom header (`TabHeader` in `_layout.tsx`, with profile picture) and an NC State red (`#bc1823`) active tab style.

`example/` is gitignored scratch/reference code; ignore it.
