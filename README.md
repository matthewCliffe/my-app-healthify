# Healthify

Healthify is a polished **Next.js App Router** fitness tracker built to satisfy a full-stack course rubric.

## Included features

- Authentication with **Firebase Identity Toolkit** REST API
- Protected dashboard routes with **middleware**
- Role-based access (`user` and `admin` demo roles)
- Persistent storage with **Firestore REST API** when Firebase env vars are provided
- Demo mode fallback so the app still runs without external keys
- CRUD Route Handlers for profile, goals, meals, workouts, and recipes
- External REST integration for **ExerciseDB** plus local food search for nutrition logging
- Responsive dashboard with streaks, achievements, friends, recipe sharing, and charts
- Loading and error boundaries
- Accessible forms, buttons, states, and semantic sections

## Routes

- `/` landing page
- `/login` and `/signup`
- `/dashboard`
- `/dashboard/admin` (admin-only)

## Environment variables

Copy `.env.example` to `.env.local` and fill in your own values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
EXERCISE_DB_API_KEY=
HEALTHIFY_ADMIN_EMAIL=admin@healthify.app
```

## Demo accounts

When Firebase is not configured:

- **Admin:** `admin@healthify.app` / `password123`
- **User:** `demo@healthify.app` / `password123`

## Deployment notes

This codebase is deployment-ready for Vercel, but publishing to a live Vercel URL and linking GitHub auto-deploy still must be completed in your own Vercel account.

## Suggested Firestore collections

```text
users/{uid}/profile/main
users/{uid}/goals/{goalId}
users/{uid}/meals/{mealId}
users/{uid}/workouts/{workoutId}
users/{uid}/recipes/{recipeId}
```

## Grading coverage

### 1. Next.js Fundamentals
- App Router and route groups
- Server and client component split
- `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`
- Middleware-protected routes

### 2. UI/UX Design
- Responsive layout
- Empty states, success/error alerts, and loading states
- Accessible buttons, labels, and landmarks

### 3. Authentication
- Sign up, log in, log out
- Session persistence through HTTP-only cookies
- Protected routes and role-based admin route

### 4. Full-Stack API Development
- Route Handlers using GET, POST, PUT, PATCH, and DELETE
- Error handling and status codes
- Frontend and backend integration

### 5. Third-Party Database
- Firestore persistence when configured
- Structured user subcollections for CRUD data

### 6. RESTful API Integration
- ExerciseDB search proxy
- Local food search route for nutrition logging
