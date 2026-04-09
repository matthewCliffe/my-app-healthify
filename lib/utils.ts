import type { Meal, Workout } from "./types";

export function formatDateTime(input: string) {
  return new Date(input).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatDate(input: string) {
  return new Date(input).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function calculateWeight(meals: Meal[], workouts: Workout[], baseWeight: number) {
  const intake = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const burned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
  return Number((baseWeight + (intake - burned) / 3500).toFixed(1));
}

export function buildChartSeries(meals: Meal[], workouts: Workout[], baseWeight = 180) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalBurned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);
  const totalMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 20), 0);

  return labels.map((label, index) => ({
    label,
    caloriesIn: Math.max(0, Math.round(totalCalories / 7 + (index % 2 === 0 ? 90 : -40))),
    caloriesOut: Math.max(0, Math.round(totalBurned / 7 + (index % 3 === 0 ? 60 : -20))),
    protein: Math.max(0, Math.round(totalProtein / 7 + (index % 2 === 0 ? 8 : -4))),
    workoutMinutes: Math.max(0, Math.round(totalMinutes / 7 + (index % 2 === 0 ? 12 : -6))),
    weight: Number((baseWeight - index * 0.3 + (index % 2 === 0 ? 0.15 : -0.1)).toFixed(1)),
  }));
}

export function generateId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
