# Healthify

Healthify is a Next.js fitness and wellness tracker with authentication, profile management, workout logging, nutrition logging, goals, recipe search, social sharing, and an admin dashboard. It runs in demo mode by default and can persist data to Firebase when environment variables are configured.

## Current features

- Email/password authentication with protected dashboard routes
- Profile settings for current weight, calorie goal, and workout goal
- Top progress section with current weight, workout minutes, goals completed, carb total, fat total, calories consumed, protein total, and workouts logged
- Workout logger with manual entries plus ExerciseDB-powered workout search and save
- Nutrition logger with manual entries plus food search and save
- Goal creation and completion tracking
- Recipe search through TheMealDB proxy route with ingredient and macro display, plus save support
- Social area for searching users by name, adding friends, and sharing workouts, goals, and recipes
- Achievements, streak tracking, charts, and an admin panel
- Demo mode fallback when Firebase is not configured

## Main routes

- `/` landing page
- `/login`
- `/signup`
- `/dashboard`
- `/dashboard/admin`

## API routes used by the app

- `/api/profile`
- `/api/workouts`
- `/api/meals`
- `/api/goals`
- `/api/recipes`
- `/api/social/friends`
- `/api/social/share`
- `/api/search/exercises`
- `/api/search/foods`
- `/api/search/recipes`

Notes:

- Exercise search uses `EXERCISE_DB_API_KEY`.
- Recipe search currently uses TheMealDB through the app route and does not require a recipe API key.
- If Firebase values are omitted, the app still runs in demo mode.

## Project structure

- `app/` App Router pages and API routes
- `components/` UI for auth, dashboard, charts, and admin tools
- `lib/` types, mock data, utility helpers, Firebase helpers, and server data access

## Current behavior notes

- Workout search results can be saved directly into the workout log.
- Food search results can be saved directly into the nutrition log.
- Recipe search results can be saved directly into saved recipes.
- Social sharing filters the second dropdown based on the selected share type.
- Recipe nutrition values are estimated from matched ingredient data when returned from recipe search.

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
