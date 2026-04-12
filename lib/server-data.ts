import { ACHIEVEMENTS, adminProfile, defaultProfile, demoUsers, getDemoDashboard } from "./mock-data";
import { createDocument, deleteDocument, getDocument, getSession, hasFirebaseConfig, listDocuments, requireAdminSession, requireSession, updateDocument, upsertDocument } from "./firebase";
import type { DashboardData, Goal, Meal, PublicUser, Recipe, SharePost, UserProfile, Workout } from "./types";
import { toDateKey } from "./utils";

const profilePath = (uid: string) => `users/${uid}/profile/main`;
const publicProfilePath = (uid: string) => `profiles/${uid}`;
const publicProfilesCollection = "profiles";
const collectionPath = (uid: string, key: "goals" | "meals" | "workouts" | "recipes" | "posts") => `users/${uid}/${key}`;
const documentPath = (uid: string, key: "goals" | "meals" | "workouts" | "recipes" | "posts", id: string) => `users/${uid}/${key}/${id}`;

function toPublicUser(profile: UserProfile, uid: string): PublicUser {
  return { id: uid, name: profile.name, email: profile.email, role: profile.role, joinedAt: profile.joinedAt };
}

function normalizeProfile(profile: Partial<UserProfile>, email: string, role: "user" | "admin"): UserProfile {
  return {
    ...(role === "admin" ? adminProfile : defaultProfile),
    ...profile,
    email,
    role,
    achievements: Array.isArray(profile.achievements) ? profile.achievements : [],
    friends: Array.isArray(profile.friends) ? profile.friends : [],
  };
}

function evaluateAchievements(profile: UserProfile, meals: Meal[], workouts: Workout[]) {
  const unlocked = new Set(profile.achievements || []);

  if (profile.dailyStreak >= 7) unlocked.add("7 Day Streak");
  if (workouts.length > 0) unlocked.add("First Workout");

  const caloriesByDay = meals.reduce<Record<string, number>>((acc, meal) => {
    const key = toDateKey(meal.loggedAt);
    acc[key] = (acc[key] || 0) + meal.calories;
    return acc;
  }, {});

  if (Object.values(caloriesByDay).some((total) => total >= profile.goalCalories)) {
    unlocked.add("Calorie Goal Hit");
  }

  return Array.from(unlocked);
}

function getNotificationText(previous: string[], next: string[]) {
  const previousSet = new Set(previous);
  const unlocked = next.filter((item) => !previousSet.has(item));
  return unlocked.length ? `Achievement unlocked: ${unlocked.join(", ")}` : null;
}

export async function getAllUsers(): Promise<PublicUser[]> {
  if (!hasFirebaseConfig()) return demoUsers;
  const session = await requireSession();
  const users = await listDocuments(publicProfilesCollection, session.idToken);
  return (users as PublicUser[]).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProfileServer(): Promise<UserProfile> {
  const session = await getSession();
  const role = session?.role || "user";
  if (!hasFirebaseConfig()) return role === "admin" ? adminProfile : defaultProfile;
  const active = await requireSession();
  const stored = (await getDocument(profilePath(active.localId), active.idToken)) as UserProfile | null;
  return stored || normalizeProfile({}, active.email, active.role);
}

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  const role = session?.role || "user";
  if (!hasFirebaseConfig()) return getDemoDashboard(role);

  const active = await requireSession();
  const [profile, goals, meals, workouts, recipes, ownPosts, users] = await Promise.all([
    getDocument(profilePath(active.localId), active.idToken),
    listDocuments(collectionPath(active.localId, "goals"), active.idToken),
    listDocuments(collectionPath(active.localId, "meals"), active.idToken),
    listDocuments(collectionPath(active.localId, "workouts"), active.idToken),
    listDocuments(collectionPath(active.localId, "recipes"), active.idToken),
    listDocuments(collectionPath(active.localId, "posts"), active.idToken),
    getAllUsers(),
  ]);

  const activeProfile = ((profile as UserProfile | null) || normalizeProfile({}, active.email, active.role));
  const friendIds = users.filter((user) => activeProfile.friends.includes(user.email)).map((user) => user.id);
  const friendPosts = await Promise.all(friendIds.map((uid) => listDocuments(collectionPath(uid, "posts"), active.idToken).catch(() => [])));

  return {
    profile: activeProfile,
    goals: goals as Goal[],
    meals: meals as Meal[],
    workouts: workouts as Workout[],
    recipes: recipes as Recipe[],
    posts: [...(ownPosts as SharePost[]), ...friendPosts.flat() as SharePost[]].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    users,
  };
}

export async function seedUserData(profile: UserProfile, localId: string, idToken: string) {
  await upsertDocument(profilePath(localId), profile, idToken);
  await upsertDocument(publicProfilePath(localId), toPublicUser(profile, localId), idToken);
}

export async function createItem<T extends Goal | Meal | Workout | Recipe | SharePost>(kind: "goals" | "meals" | "workouts" | "recipes" | "posts", payload: T) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return payload;
  await upsertDocument(documentPath(session.localId, kind, payload.id), payload as unknown as Record<string, unknown>, session.idToken);
  return payload;
}

export async function updateItem<T extends Goal | Meal | Workout | Recipe>(kind: "goals" | "meals" | "workouts" | "recipes", id: string, payload: T) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return payload;
  await updateDocument(documentPath(session.localId, kind, id), payload as unknown as Record<string, unknown>, session.idToken);
  return payload;
}

export async function removeItem(kind: "goals" | "meals" | "workouts" | "recipes" | "posts", id: string) {
  const session = await requireSession();
  if (!hasFirebaseConfig()) return true;
  await deleteDocument(documentPath(session.localId, kind, id), session.idToken);
  return true;
}

export async function syncAchievements() {
  const session = await requireSession();
  const current = await getProfileServer();
  const [meals, workouts] = await Promise.all([
    hasFirebaseConfig() ? listDocuments(collectionPath(session.localId, "meals"), session.idToken) : [],
    hasFirebaseConfig() ? listDocuments(collectionPath(session.localId, "workouts"), session.idToken) : [],
  ]);
  const achievements = evaluateAchievements(current, meals as Meal[], workouts as Workout[]);
  const next = { ...current, achievements };
  if (hasFirebaseConfig()) {
    await upsertDocument(profilePath(session.localId), next, session.idToken);
    await upsertDocument(publicProfilePath(session.localId), toPublicUser(next, session.localId), session.idToken);
  }
  return { profile: next, notification: getNotificationText(current.achievements || [], achievements) };
}

export async function updateProfile(payload: Partial<UserProfile>) {
  const session = await requireSession();
  const current = hasFirebaseConfig()
    ? (((await getDocument(profilePath(session.localId), session.idToken)) as UserProfile | null) || normalizeProfile({}, session.email, session.role))
    : normalizeProfile({}, session.email, session.role);

  const nextProfile: UserProfile = {
    ...current,
    ...payload,
    role: current.role,
    email: current.email,
    achievements: payload.achievements ?? current.achievements,
    friends: payload.friends ?? current.friends,
  };
  if (hasFirebaseConfig()) {
    await upsertDocument(profilePath(session.localId), nextProfile, session.idToken);
    await upsertDocument(publicProfilePath(session.localId), toPublicUser(nextProfile, session.localId), session.idToken);
  }
  return nextProfile;
}

export async function addFriend(friendEmail: string) {
  const current = await getProfileServer();
  const friends = Array.from(new Set([...(current.friends || []), friendEmail])).filter((email) => email !== current.email);
  return updateProfile({ friends });
}

export async function removeFriend(friendEmail: string) {
  const current = await getProfileServer();
  return updateProfile({ friends: (current.friends || []).filter((email) => email !== friendEmail) });
}

export async function recordLogin(localId: string, idToken: string, email: string, role: "user" | "admin") {
  if (!hasFirebaseConfig()) return role === "admin" ? adminProfile : defaultProfile;
  const existing = ((await getDocument(profilePath(localId), idToken)) as UserProfile | null) || normalizeProfile({}, email, role);
  const today = new Date();
  const todayKey = toDateKey(today.toISOString());
  const lastKey = existing.lastLoginDate ? toDateKey(existing.lastLoginDate) : null;
  let dailyStreak = existing.dailyStreak || 0;

  if (lastKey === todayKey) {
    dailyStreak = existing.dailyStreak || 1;
  } else if (lastKey) {
    const diff = Math.round((new Date(todayKey).getTime() - new Date(lastKey).getTime()) / 86400000);
    dailyStreak = diff === 1 ? (existing.dailyStreak || 0) + 1 : 1;
  } else {
    dailyStreak = 1;
  }

  const next = {
    ...existing,
    dailyStreak,
    lastLoginDate: today.toISOString(),
  };
  next.achievements = evaluateAchievements(next, [], []);

  await upsertDocument(profilePath(localId), next, idToken);
  await upsertDocument(publicProfilePath(localId), toPublicUser(next, localId), idToken);
  return next;
}

export async function getAdminSummary() {
  await requireAdminSession();
  return { achievements: ACHIEVEMENTS, users: await getAllUsers() };
}

export async function unlockAllAchievementsForUser(userId?: string) {
  await requireAdminSession();
  if (!hasFirebaseConfig()) return { achievements: ACHIEVEMENTS.map((item) => item.title) };
  const session = await requireSession();
  const targetId = userId || session.localId;
  const current = ((await getDocument(profilePath(targetId), session.idToken)) as UserProfile | null) || defaultProfile;
  const updated = { ...current, achievements: ACHIEVEMENTS.map((item) => item.title) };
  await upsertDocument(profilePath(targetId), updated, session.idToken);
  await upsertDocument(publicProfilePath(targetId), toPublicUser(updated, targetId), session.idToken);
  return updated;
}

export async function addSampleVisualizationDataForUser(userId?: string) {
  await requireAdminSession();
  const session = await requireSession();
  const targetId = userId || session.localId;
  const targetProfile = !hasFirebaseConfig()
    ? (session.role === "admin" ? adminProfile : defaultProfile)
    : (((await getDocument(profilePath(targetId), session.idToken)) as UserProfile | null) || defaultProfile);

  const days = [6, 5, 4, 3, 2, 1, 0];
  const meals: Meal[] = days.map((daysAgo, index) => ({
    id: `sample-meal-${targetId}-${daysAgo}`,
    name: `Sample meal ${index + 1}`,
    quantity: "1",
    calories: 1800 + index * 120,
    protein: 120 + index * 5,
    carbs: 180 + index * 10,
    fat: 55 + index * 3,
    mealType: "dinner",
    loggedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  }));

  const workouts: Workout[] = days.map((daysAgo, index) => ({
    id: `sample-workout-${targetId}-${daysAgo}`,
    type: index % 2 === 0 ? "strength" : "cardio",
    exercise: index % 2 === 0 ? "Strength Session" : "Cardio Session",
    duration: 25 + index * 5,
    caloriesBurned: 180 + index * 20,
    performedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  }));

  if (hasFirebaseConfig()) {
    await Promise.all(meals.map((meal) => upsertDocument(documentPath(targetId, "meals", meal.id), meal, session.idToken)));
    await Promise.all(workouts.map((workout) => upsertDocument(documentPath(targetId, "workouts", workout.id), workout, session.idToken)));
    const achievements = evaluateAchievements(targetProfile, meals, workouts);
    await upsertDocument(profilePath(targetId), { ...targetProfile, achievements }, session.idToken);
  }

  return { meals, workouts };
}

export function getDefaultProfileFor(email: string, role: "user" | "admin"): UserProfile {
  return normalizeProfile({}, email, role);
}
