import type { AchievementDefinition, DashboardData, Goal, Meal, PublicUser, Recipe, SharePost, UserProfile, Workout } from "./types";

const now = new Date();
const iso = (daysAgo = 0) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "7-day-streak", title: "7 Day Streak", description: "Log in 7 days in a row" },
  { id: "first-workout", title: "First Workout", description: "Save your first workout" },
  { id: "calorie-goal-hit", title: "Calorie Goal Hit", description: "Hit your calorie goal for the first time" },
];

export const defaultProfile: UserProfile = {
  name: "Healthify User",
  email: "demo@healthify.app",
  role: "user",
  currentWeight: 0,
  dailyStreak: 0,
  achievements: [],
  friends: [],
  dailyCaloricIntake: 0,
  weeklyCaloricIntake: 0,
  goalCalories: 2200,
  goalWorkoutsPerWeek: 3,
  joinedAt: iso(0),
  lastLoginDate: iso(0),
};

export const adminProfile: UserProfile = {
  ...defaultProfile,
  name: "Admin Coach",
  email: process.env.HEALTHIFY_ADMIN_EMAIL || "admin@healthify.app",
  role: "admin",
};

export const sampleGoals: Goal[] = [];
export const sampleMeals: Meal[] = [];
export const sampleWorkouts: Workout[] = [];
export const sampleRecipes: Recipe[] = [];
export const samplePosts: SharePost[] = [];

export const demoUsers: PublicUser[] = [
  { id: "demo-admin", name: adminProfile.name, email: adminProfile.email, role: "admin", joinedAt: iso(30) },
  { id: "demo-user", name: "Healthify User", email: defaultProfile.email, role: "user", joinedAt: iso(10) },
  { id: "demo-ava", name: "Ava Stone", email: "ava@example.com", role: "user", joinedAt: iso(8) },
  { id: "demo-noah", name: "Noah Cruz", email: "noah@example.com", role: "user", joinedAt: iso(7) },
  { id: "demo-mia", name: "Mia Brooks", email: "mia@example.com", role: "user", joinedAt: iso(5) },
];

export const sampleExercises = [
  { id: "push-up", name: "Push-Up", bodyPart: "chest", equipment: "body weight", target: "pectorals" },
  { id: "squat", name: "Back Squat", bodyPart: "legs", equipment: "barbell", target: "quadriceps" },
  { id: "run", name: "Treadmill Run", bodyPart: "cardio", equipment: "treadmill", target: "cardiovascular system" },
  { id: "deadlift", name: "Romanian Deadlift", bodyPart: "legs", equipment: "barbell", target: "hamstrings" },
  { id: "row", name: "Seated Row", bodyPart: "back", equipment: "cable", target: "lats" },
  { id: "plank", name: "Plank", bodyPart: "core", equipment: "body weight", target: "abdominals" },
  { id: "bike", name: "Stationary Bike", bodyPart: "cardio", equipment: "bike", target: "cardiovascular system" },
  { id: "lunges", name: "Walking Lunges", bodyPart: "legs", equipment: "dumbbell", target: "glutes" },
];

export const sampleFoods = [
  ["apple", 1, "medium", 95, 0, 25, 0],
  ["banana", 1, "medium", 105, 1, 27, 0],
  ["orange", 1, "medium", 62, 1, 15, 0],
  ["strawberries", 1, "cup", 49, 1, 12, 0],
  ["blueberries", 1, "cup", 84, 1, 21, 0],
  ["grapes", 1, "cup", 104, 1, 27, 0],
  ["pineapple", 1, "cup", 82, 1, 22, 0],
  ["watermelon", 1, "cup", 46, 1, 12, 0],
  ["broccoli", 1, "cup", 31, 3, 6, 0],
  ["spinach", 1, "cup", 7, 1, 1, 0],
  ["carrots", 1, "cup", 52, 1, 12, 0],
  ["sweet potato", 1, "medium", 112, 2, 26, 0],
  ["white potato", 1, "medium", 161, 4, 37, 0],
  ["brown rice", 1, "cup", 216, 5, 45, 2],
  ["white rice", 1, "cup", 205, 4, 45, 0],
  ["quinoa", 1, "cup", 222, 8, 39, 4],
  ["rolled oats", 1, "cup", 307, 11, 55, 5],
  ["whole wheat bread", 2, "slices", 160, 8, 28, 2],
  ["bagel", 1, "medium", 277, 11, 55, 1],
  ["pasta", 1, "cup", 221, 8, 43, 1],
  ["grilled chicken breast", 1, "breast", 187, 35, 0, 4],
  ["ground turkey", 4, "oz", 170, 22, 0, 9],
  ["salmon", 1, "fillet", 233, 25, 0, 14],
  ["tuna", 1, "can", 191, 42, 0, 1],
  ["lean beef", 4, "oz", 230, 23, 0, 15],
  ["shrimp", 4, "oz", 120, 23, 1, 1],
  ["tofu", 4, "oz", 94, 10, 2, 6],
  ["tempeh", 3, "oz", 160, 17, 9, 9],
  ["black beans", 1, "cup", 227, 15, 41, 1],
  ["lentils", 1, "cup", 230, 18, 40, 1],
  ["eggs", 2, "large", 144, 12, 1, 10],
  ["egg whites", 1, "cup", 126, 27, 2, 0],
  ["greek yogurt", 1, "cup", 130, 23, 9, 0],
  ["cottage cheese", 1, "cup", 206, 28, 8, 6],
  ["cheddar cheese", 1, "oz", 114, 7, 1, 9],
  ["milk", 1, "cup", 122, 8, 12, 5],
  ["almonds", 1, "oz", 164, 6, 6, 14],
  ["peanut butter", 2, "tbsp", 190, 8, 7, 16],
  ["walnuts", 1, "oz", 185, 4, 4, 18],
  ["avocado", 1, "half", 120, 2, 6, 11],
  ["olive oil", 1, "tbsp", 119, 0, 0, 14],
  ["hummus", 2, "tbsp", 70, 2, 4, 5],
  ["protein shake", 1, "bottle", 160, 30, 6, 3],
  ["turkey sandwich", 1, "sandwich", 320, 24, 32, 10],
  ["caesar salad", 1, "bowl", 180, 7, 8, 14],
  ["chicken rice bowl", 1, "bowl", 620, 42, 58, 16],
  ["beef burrito", 1, "burrito", 540, 28, 54, 22],
  ["veggie wrap", 1, "wrap", 310, 10, 39, 12],
  ["oatmeal", 1, "serving", 340, 18, 46, 9],
  ["granola bar", 1, "bar", 190, 4, 29, 7],
  ["trail mix", 1, "oz", 173, 5, 15, 11],
  ["yogurt parfait", 1, "cup", 220, 12, 31, 5],
  ["pancakes", 3, "pancakes", 350, 8, 58, 9],
  ["turkey chili", 1, "cup", 290, 24, 24, 10],
  ["fried rice", 1, "cup", 333, 7, 43, 14],
  ["sushi roll", 1, "roll", 255, 9, 38, 7],
].map(([food_name, serving_qty, serving_unit, nf_calories, nf_protein, nf_total_carbohydrate, nf_total_fat]) => ({
  food_name,
  serving_qty,
  serving_unit,
  nf_calories,
  nf_protein,
  nf_total_carbohydrate,
  nf_total_fat,
}));

export function getDemoDashboard(role: "user" | "admin" = "user"): DashboardData {
  return {
    profile: role === "admin" ? adminProfile : defaultProfile,
    meals: sampleMeals,
    workouts: sampleWorkouts,
    goals: sampleGoals,
    recipes: sampleRecipes,
    posts: samplePosts,
    users: demoUsers,
  };
}
