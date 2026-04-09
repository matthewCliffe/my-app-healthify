import { adminProfile, defaultProfile, getDemoDashboard, sampleGoals, sampleMeals, samplePosts, sampleRecipes, sampleWorkouts } from "./mock-data";
import { createDocument, deleteDocument, getDocument, getSession, hasFirebaseConfig, listDocuments, requireAdminSession, requireSession, updateDocument, upsertDocument } from "./firebase";
import type { DashboardData, Goal, Meal, Recipe, UserProfile, Workout } from "./types";

const profilePath = (uid: string) => `users/${uid}/profile/main`;
const collectionPath = (uid: string, key: "goals" | "meals" | "workouts" | "recipes") => `users/${uid}/${key}`;
const documentPath = (uid: string, key: "goals" | "meals" | "workouts" | "recipes", id: string) => `users/${uid}/${key}/${id}`;

export async function getProfileServer(): Promise<UserProfile> {
  const session = await getSession();
  const role = session?.role || "user";
  if (!hasFirebaseConfig()) return role === "admin" ? adminProfile : defaultProfile;
  const active = await requireSession();
  return (await getDocument(profilePath(active.localId), active.idToken)) as UserProfile;
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  const role = session?.role || "user";
  if (!hasFirebaseConfig()) return getDemoDashboard(role);

  const active = await requireSession();
  const [profile, goals, meals, workouts, recipes] = await Promise.all([
    getDocument(profilePath(active.localId), active.idToken),
    listDocuments(collectionPath(active.localId, "goals"), active.idToken),
    listDocuments(collectionPath(active.localId, "meals"), active.idToken),
    listDocuments(collectionPath(active.localId, "workouts"), active.idToken),
    listDocuments(collectionPath(active.localId, "recipes"), active.idToken),
  ]);

  return {
    profile: (profile as UserProfile) || defaultProfile,
    goals: goals as Goal[],
    meals: meals as Meal[],
    workouts: workouts as Workout[],
    recipes: recipes as Recipe[],
    posts: samplePosts,
  };
}

export async function seedUserData(profile: UserProfile, localId: string, idToken: string) {
  await upsertDocument(profilePath(localId), profile, idToken);
  await Promise.all(sampleGoals.map((goal) => createDocument(collectionPath(localId, "goals"), goal, idToken)));
  await Promise.all(sampleMeals.map((meal) => createDocument(collectionPath(localId, "meals"), meal, idToken)));
  await Promise.all(sampleWorkouts.map((workout) => createDocument(collectionPath(localId, "workouts"), workout, idToken)));
  await Promise.all(sampleRecipes.map((recipe) => createDocument(collectionPath(localId, "recipes"), recipe, idToken)));
}

export async function createItem<T extends Goal | Meal | Workout | Recipe>(kind: "goals" | "meals" | "workouts" | "recipes", payload: T) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return payload;
  await createDocument(collectionPath(session.localId, kind), payload as unknown as Record<string, unknown>, session.idToken);
  return payload;
}

export async function updateItem<T extends Goal | Meal | Workout | Recipe>(kind: "goals" | "meals" | "workouts" | "recipes", id: string, payload: T) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return payload;
  await updateDocument(documentPath(session.localId, kind, id), payload as unknown as Record<string, unknown>, session.idToken);
  return payload;
}

export async function removeItem(kind: "goals" | "meals" | "workouts" | "recipes", id: string) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return true;
  await deleteDocument(documentPath(session.localId, kind, id), session.idToken);
  return true;
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const session = await requireSession();
  const current = hasFirebaseConfig()
    ? (((await getDocument(profilePath(session.localId), session.idToken)) as UserProfile) || defaultProfile)
    : { ...(session.role === "admin" ? adminProfile : defaultProfile), email: session.email };

  const nextProfile = { ...current, ...payload, role: current.role, email: current.email };
  if (hasFirebaseConfig()) {
    await upsertDocument(profilePath(session.localId), nextProfile, session.idToken);
  }
  return nextProfile;
}

export async function getAdminSummary() {
  await requireAdminSession();
  return [
    { label: "Registered roles", value: "user + admin", description: "The app demonstrates role-based route protection." },
    { label: "Tracked modules", value: "5", description: "Goals, meals, workouts, recipes, and profile records." },
    { label: "REST integrations", value: "2", description: "Exercise search and food search endpoints." },
    { label: "Demo seed records", value: String(sampleGoals.length + sampleMeals.length + sampleWorkouts.length + sampleRecipes.length), description: "Seeded content appears instantly in demo mode." },
  ];
}

export function getDefaultProfileFor(email: string, role: "user" | "admin"): UserProfile {
  return {
    ...(role === "admin" ? adminProfile : defaultProfile),
    email,
    role,
  };
}
