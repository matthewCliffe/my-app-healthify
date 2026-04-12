import type { Meal, Workout } from "./types";

export function formatDateTime(input: string) {
  return new Date(input).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function formatDate(input: string) {
  return new Date(input).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function toDateKey(input: string) {
  return new Date(input).toISOString().slice(0, 10);
}

export function lastSevenDays() {
  const days: { label: string; key: string }[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    days.push({
      label: date.toLocaleDateString([], { weekday: "short" }),
      key: date.toISOString().slice(0, 10),
    });
  }
  return days;
}

export function buildChartSeries(meals: Meal[], workouts: Workout[]) {
  const days = lastSevenDays();
  return days.map((day) => {
    const dayMeals = meals.filter((meal) => toDateKey(meal.loggedAt) === day.key);
    const dayWorkouts = workouts.filter((workout) => toDateKey(workout.performedAt) === day.key);

    return {
      label: day.label,
      weeklyCalories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
      weeklyCarbs: dayMeals.reduce((sum, meal) => sum + meal.carbs, 0),
      weeklyProtein: dayMeals.reduce((sum, meal) => sum + meal.protein, 0),
      weeklyFat: dayMeals.reduce((sum, meal) => sum + meal.fat, 0),
      weeklyWorkoutMinutes: dayWorkouts.reduce((sum, workout) => sum + (workout.duration || 0), 0),
    };
  });
}

export function generateId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
