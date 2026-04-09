import type { DashboardData, Goal, Meal, Recipe, SharePost, UserProfile, Workout } from "./types";

const now = new Date();
const iso = (daysAgo = 0) => new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const defaultProfile: UserProfile = {
  name: "Healthify User",
  email: "demo@healthify.app",
  role: "user",
  currentWeight: 180,
  weightLost: 8,
  dailyStreak: 12,
  achievements: ["7-Day Streak", "First Workout", "Protein Goal Hit", "Recipe Creator"],
  friends: ["Alex", "Jordan", "Taylor"],
  dailyCaloricIntake: 2120,
  weeklyCaloricIntake: 14750,
  goalCalories: 2200,
  goalWorkoutsPerWeek: 4,
  joinedAt: iso(60),
};

export const adminProfile: UserProfile = {
  ...defaultProfile,
  name: "Admin Coach",
  email: "admin@healthify.app",
  role: "admin",
};

export const sampleGoals: Goal[] = [
  { id: "goal-1", title: "Daily calories", target: "Stay under 2200 kcal", category: "nutrition", completed: false, createdAt: iso(1) },
  { id: "goal-2", title: "Workout frequency", target: "Complete 4 workouts this week", category: "fitness", completed: true, createdAt: iso(3) },
  { id: "goal-3", title: "Hydration habit", target: "Drink 2 liters of water daily", category: "habit", completed: false, createdAt: iso(5) },
];

export const sampleMeals: Meal[] = [
  { id: "meal-1", name: "Chicken rice bowl", quantity: "1 bowl", calories: 620, protein: 42, carbs: 58, fat: 16, mealType: "lunch", loggedAt: iso(0) },
  { id: "meal-2", name: "Greek yogurt", quantity: "1 cup", calories: 150, protein: 15, carbs: 10, fat: 4, mealType: "snack", loggedAt: iso(1) },
  { id: "meal-3", name: "Oatmeal", quantity: "1 serving", calories: 340, protein: 18, carbs: 46, fat: 9, mealType: "breakfast", loggedAt: iso(2) },
];

export const sampleWorkouts: Workout[] = [
  { id: "workout-1", type: "strength", exercise: "Bench Press", sets: 4, reps: 8, weight: 135, caloriesBurned: 210, performedAt: iso(0) },
  { id: "workout-2", type: "cardio", exercise: "Cycling", duration: 30, caloriesBurned: 280, performedAt: iso(1) },
  { id: "workout-3", type: "custom", exercise: "Mobility Flow", duration: 20, caloriesBurned: 90, description: "Stretch + core", performedAt: iso(3) },
];

export const sampleRecipes: Recipe[] = [
  {
    id: "recipe-1",
    name: "High Protein Breakfast",
    description: "Oats, berries, yogurt, and protein powder.",
    items: [
      { name: "Rolled oats", quantity: "50g", calories: 190 },
      { name: "Greek yogurt", quantity: "170g", calories: 100 },
      { name: "Blueberries", quantity: "1/2 cup", calories: 42 },
    ],
    createdAt: iso(4),
    shared: true,
  },
];

export const samplePosts: SharePost[] = [
  { id: "post-1", author: "Alex", kind: "workout", text: "Shared a leg day workout and burned 420 kcal.", createdAt: iso(0) },
  { id: "post-2", author: "Jordan", kind: "recipe", text: "Posted a chicken wrap meal-prep recipe.", createdAt: iso(1) },
  { id: "post-3", author: "Taylor", kind: "goal", text: "Completed a 10,000 step goal for the week.", createdAt: iso(2) },
];

export const sampleExercises = [
  { id: "push-up", name: "Push-Up", bodyPart: "chest", equipment: "body weight", target: "pectorals" },
  { id: "squat", name: "Back Squat", bodyPart: "legs", equipment: "barbell", target: "quadriceps" },
  { id: "run", name: "Treadmill Run", bodyPart: "cardio", equipment: "treadmill", target: "cardiovascular system" },
  { id: "deadlift", name: "Romanian Deadlift", bodyPart: "legs", equipment: "barbell", target: "hamstrings" },
];

export const sampleFoods = [
  { food_name: "grilled chicken breast", serving_qty: 1, serving_unit: "breast", nf_calories: 187, nf_protein: 35, nf_total_carbohydrate: 0, nf_total_fat: 4 },
  { food_name: "brown rice", serving_qty: 1, serving_unit: "cup", nf_calories: 216, nf_protein: 5, nf_total_carbohydrate: 45, nf_total_fat: 2 },
  { food_name: "banana", serving_qty: 1, serving_unit: "medium", nf_calories: 105, nf_protein: 1, nf_total_carbohydrate: 27, nf_total_fat: 0 },
  { food_name: "salmon", serving_qty: 1, serving_unit: "fillet", nf_calories: 233, nf_protein: 25, nf_total_carbohydrate: 0, nf_total_fat: 14 },
];

export function getDemoDashboard(role: "user" | "admin" = "user"): DashboardData {
  return {
    profile: role === "admin" ? adminProfile : defaultProfile,
    meals: sampleMeals,
    workouts: sampleWorkouts,
    goals: sampleGoals,
    recipes: sampleRecipes,
    posts: samplePosts,
  };
}
