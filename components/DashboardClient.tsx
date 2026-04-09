"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LineChart } from "./LineChart";
import type { DashboardData, Goal, GoalCategory, Meal, MealType, Recipe, UserProfile, Workout, WorkoutType } from "@/lib/types";
import { buildChartSeries, formatDate, formatDateTime, generateId } from "@/lib/utils";

type Props = DashboardData & { firebaseEnabled: boolean };

type Metric = "caloriesIn" | "caloriesOut" | "protein" | "workoutMinutes" | "weight";

type FoodSearchResult = {
  food_name: string;
  nf_calories: number;
  nf_protein: number;
  nf_total_carbohydrate: number;
  nf_total_fat: number;
};

type ExerciseSearchResult = {
  id?: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
};

export function DashboardClient({ profile, meals: initialMeals, workouts: initialWorkouts, goals: initialGoals, recipes: initialRecipes, posts, firebaseEnabled }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeProfile, setActiveProfile] = useState<UserProfile>(profile);
  const [meals, setMeals] = useState(initialMeals);
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [goals, setGoals] = useState(initialGoals);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [message, setMessage] = useState(firebaseEnabled ? "Connected to Firebase-ready routes." : "Running in demo mode until Firebase environment values are added.");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [exerciseResults, setExerciseResults] = useState<ExerciseSearchResult[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric>("caloriesIn");

  const adminDenied = searchParams.get("denied") === "1";

  const chartData = useMemo(() => {
    return buildChartSeries(meals, workouts, activeProfile.currentWeight).map((item) => ({ label: item.label, value: item[selectedMetric] }));
  }, [meals, workouts, activeProfile.currentWeight, selectedMetric]);

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const totalWorkoutMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const totalCaloriesBurned = workouts.reduce((sum, workout) => sum + workout.caloriesBurned, 0);

  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      setError(message);
      throw caught;
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function handleProfileUpdate(formData: FormData) {
    const payload = {
      currentWeight: Number(formData.get("currentWeight")),
      goalCalories: Number(formData.get("goalCalories")),
      goalWorkoutsPerWeek: Number(formData.get("goalWorkoutsPerWeek")),
    };
    const data = await request<{ item: UserProfile }>("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setActiveProfile(data.item);
    setMessage("Profile updated successfully.");
  }

  async function handleWorkout(formData: FormData) {
    const payload: Workout = {
      id: generateId("workout"),
      type: String(formData.get("type")) as WorkoutType,
      exercise: String(formData.get("exercise")),
      sets: Number(formData.get("sets") || 0) || undefined,
      reps: Number(formData.get("reps") || 0) || undefined,
      weight: Number(formData.get("weight") || 0) || undefined,
      duration: Number(formData.get("duration") || 0) || undefined,
      caloriesBurned: Number(formData.get("caloriesBurned") || 0),
      description: String(formData.get("description") || ""),
      performedAt: new Date().toISOString(),
    };
    const data = await request<{ item: Workout }>("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setWorkouts([data.item, ...workouts]);
    setMessage("Workout saved successfully.");
  }

  async function handleMeal(formData: FormData) {
    const payload: Meal = {
      id: generateId("meal"),
      name: String(formData.get("name")),
      quantity: String(formData.get("quantity")),
      calories: Number(formData.get("calories")),
      protein: Number(formData.get("protein")),
      carbs: Number(formData.get("carbs")),
      fat: Number(formData.get("fat")),
      mealType: String(formData.get("mealType")) as MealType,
      loggedAt: new Date().toISOString(),
    };
    const data = await request<{ item: Meal }>("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMeals([data.item, ...meals]);
    setMessage("Meal logged successfully.");
  }

  async function handleGoal(formData: FormData) {
    const payload: Goal = {
      id: generateId("goal"),
      title: String(formData.get("title")),
      target: String(formData.get("target")),
      category: String(formData.get("category")) as GoalCategory,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const data = await request<{ item: Goal }>("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setGoals([data.item, ...goals]);
    setMessage("Goal added.");
  }

  async function toggleGoalCompletion(goal: Goal) {
    const payload = { ...goal, completed: !goal.completed };
    const data = await request<{ item: Goal }>(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setGoals(goals.map((item) => (item.id === goal.id ? data.item : item)));
    setMessage(goal.completed ? "Goal marked incomplete." : "Goal completed. Achievement progress updated.");
  }

  async function handleRecipe(formData: FormData) {
    const payload: Recipe = {
      id: generateId("recipe"),
      name: String(formData.get("name")),
      description: String(formData.get("description")),
      items: [
        {
          name: String(formData.get("itemName")),
          quantity: String(formData.get("itemQuantity")),
          calories: Number(formData.get("itemCalories")),
        },
      ],
      createdAt: new Date().toISOString(),
      shared: Boolean(formData.get("shared")),
    };
    const data = await request<{ item: Recipe }>("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setRecipes([data.item, ...recipes]);
    setMessage("Recipe created.");
  }

  async function deleteRecipe(recipe: Recipe) {
    await request(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    setRecipes(recipes.filter((item) => item.id !== recipe.id));
    setMessage("Recipe removed.");
  }

  async function searchFoods(formData: FormData) {
    const query = String(formData.get("query") || "");
    const data = await request<{ items: FoodSearchResult[] }>(`/api/search/foods?q=${encodeURIComponent(query)}`);
    setFoodResults(data.items || []);
    setMessage(data.items?.length ? "Food search results loaded from local nutrition data." : "No foods matched that search.");
  }

  async function searchExercises(formData: FormData) {
    const query = String(formData.get("query") || "");
    const data = await request<{ items: ExerciseSearchResult[] }>(`/api/search/exercises?q=${encodeURIComponent(query)}`);
    setExerciseResults(data.items || []);
    setMessage(data.items?.length ? "Exercise ideas loaded." : "No exercises matched that search.");
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Healthify dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Welcome back, {activeProfile.name}</h1>
          <p className="mt-2 text-slate-600">
            Track workouts, nutrition, goals, streaks, recipes, friends, and achievements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge">Streak: {activeProfile.dailyStreak} days</span>
          <span className="badge">Role: {activeProfile.role}</span>
          {activeProfile.role === "admin" && <Link href="/dashboard/admin" className="btn-outline">Admin panel</Link>}
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {adminDenied && <div className="alert-error mb-6">Admin access is restricted to users with the admin role.</div>}
      {message && <div className="alert-success mb-4">{message}</div>}
      {error && <div className="alert-error mb-6">{error}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="kpi"><div className="text-sm text-slate-500">Current weight</div><div className="mt-2 text-3xl font-bold">{activeProfile.currentWeight} lb</div></article>
        <article className="kpi"><div className="text-sm text-slate-500">Weight lost</div><div className="mt-2 text-3xl font-bold">{activeProfile.weightLost} lb</div></article>
        <article className="kpi"><div className="text-sm text-slate-500">Workout minutes</div><div className="mt-2 text-3xl font-bold">{totalWorkoutMinutes}</div></article>
        <article className="kpi"><div className="text-sm text-slate-500">Goals completed</div><div className="mt-2 text-3xl font-bold">{completedGoals}/{goals.length}</div></article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <article className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Progress visualization</h2>
            <select value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value as Metric)} className="max-w-56" aria-label="Chart metric selector">
              <option value="caloriesIn">Caloric intake</option>
              <option value="caloriesOut">Calories burned</option>
              <option value="protein">Protein</option>
              <option value="workoutMinutes">Workout minutes</option>
              <option value="weight">Weight progression</option>
            </select>
          </div>
          <LineChart data={chartData} />
          <p className="mt-4 text-sm text-slate-600">Charts can toggle between daily calories, workout burn, protein, workout time, and weight trends.</p>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Profile, streaks, and achievements</h2>
          <form action={handleProfileUpdate} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="currentWeight" className="label">Current weight</label>
                <input id="currentWeight" name="currentWeight" type="number" min={1} defaultValue={activeProfile.currentWeight} required />
              </div>
              <div>
                <label htmlFor="goalCalories" className="label">Daily calorie goal</label>
                <input id="goalCalories" name="goalCalories" type="number" min={1000} defaultValue={activeProfile.goalCalories} required />
              </div>
              <div>
                <label htmlFor="goalWorkoutsPerWeek" className="label">Workout goal / week</label>
                <input id="goalWorkoutsPerWeek" name="goalWorkoutsPerWeek" type="number" min={1} defaultValue={activeProfile.goalWorkoutsPerWeek} required />
              </div>
            </div>
            <button className="btn-primary max-w-fit" disabled={saving}>Update profile</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {activeProfile.achievements.map((achievement) => <span key={achievement} className="badge">{achievement}</span>)}
          </div>
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Friends</h3>
            {activeProfile.friends.length ? activeProfile.friends.map((friend) => (
              <div key={friend} className="surface text-sm text-slate-700">{friend} • shares workouts, recipes, goals, and charts</div>
            )) : <p className="text-sm text-slate-600">No friends added yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="card p-6">
          <h2 className="section-title">Workout logger</h2>
          <form action={handleWorkout} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="type" defaultValue="strength" aria-label="Workout type"><option value="strength">Strength</option><option value="cardio">Cardio</option><option value="custom">Custom</option></select>
              <input name="exercise" placeholder="Exercise name" required />
              <input name="sets" type="number" placeholder="Sets" min={0} />
              <input name="reps" type="number" placeholder="Reps" min={0} />
              <input name="weight" type="number" placeholder="Weight" min={0} />
              <input name="duration" type="number" placeholder="Duration in minutes" min={0} />
              <input name="caloriesBurned" type="number" placeholder="Calories burned" defaultValue={250} min={0} required />
              <input name="description" placeholder="Custom notes" />
            </div>
            <button className="btn-primary max-w-fit" disabled={saving}>Save workout</button>
          </form>

          <form action={searchExercises} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input name="query" placeholder="Search ExerciseDB for workout ideas" aria-label="Exercise search" />
            <button className="btn-secondary sm:w-auto">Search</button>
          </form>

          <div className="mt-4 space-y-3">
            {exerciseResults.length ? exerciseResults.slice(0, 4).map((exercise) => (
              <div key={exercise.id || exercise.name} className="surface text-sm">
                <div className="font-semibold text-slate-900">{exercise.name}</div>
                <div className="mt-1 text-slate-600">{exercise.bodyPart} • {exercise.target} • {exercise.equipment}</div>
              </div>
            )) : <p className="text-sm text-slate-600">Search for strength or cardio movements to populate this list.</p>}
          </div>

          <div className="mt-6 space-y-3">
            {workouts.length ? workouts.map((workout) => (
              <div key={workout.id} className="surface">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{workout.exercise}</div>
                    <div className="text-sm text-slate-600">{workout.type} • {formatDateTime(workout.performedAt)}</div>
                  </div>
                  <div className="text-sm text-slate-700">{workout.caloriesBurned} kcal</div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No workouts logged yet.</p>}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Nutrition logger</h2>
          <form action={handleMeal} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Food item" required />
              <input name="quantity" placeholder="Quantity" required />
              <input name="calories" type="number" placeholder="Calories" min={0} required />
              <input name="protein" type="number" placeholder="Protein (g)" min={0} defaultValue={20} required />
              <input name="carbs" type="number" placeholder="Carbs (g)" min={0} defaultValue={30} required />
              <input name="fat" type="number" placeholder="Fat (g)" min={0} defaultValue={10} required />
              <select name="mealType" defaultValue="lunch" aria-label="Meal type"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select>
            </div>
            <button className="btn-primary max-w-fit" disabled={saving}>Save meal</button>
          </form>

          <form action={searchFoods} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input name="query" placeholder="Search foods" aria-label="Food search" />
            <button className="btn-secondary sm:w-auto">Search</button>
          </form>

          <div className="mt-4 space-y-3">
            {foodResults.length ? foodResults.slice(0, 4).map((food) => (
              <div key={food.food_name} className="surface text-sm">
                <div className="font-semibold capitalize text-slate-900">{food.food_name}</div>
                <div className="mt-1 text-slate-600">{food.nf_calories} kcal • P {food.nf_protein} • C {food.nf_total_carbohydrate} • F {food.nf_total_fat}</div>
              </div>
            )) : <p className="text-sm text-slate-600">Search for meals to see calorie and macro suggestions.</p>}
          </div>

          <div className="mt-6 space-y-3">
            {meals.length ? meals.map((meal) => (
              <div key={meal.id} className="surface">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{meal.name}</div>
                    <div className="text-sm text-slate-600">{meal.quantity} • {meal.mealType} • {formatDateTime(meal.loggedAt)}</div>
                  </div>
                  <div className="text-sm text-slate-700">{meal.calories} kcal</div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No meals logged yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="card p-6">
          <h2 className="section-title">Goals</h2>
          <form action={handleGoal} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input name="title" placeholder="Goal title" required />
            <input name="target" placeholder="Target details" required />
            <select name="category" defaultValue="habit" aria-label="Goal category"><option value="habit">Habit</option><option value="nutrition">Nutrition</option><option value="fitness">Fitness</option><option value="weight">Weight</option></select>
            <button className="btn-primary sm:col-span-3 max-w-fit" disabled={saving}>Save goal</button>
          </form>
          <div className="mt-6 space-y-3">
            {goals.length ? goals.map((goal) => (
              <div key={goal.id} className="surface">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{goal.title}</div>
                    <div className="text-sm text-slate-600">{goal.target}</div>
                    <div className="mt-1 text-xs text-slate-500">Created {formatDate(goal.createdAt)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge">{goal.category}</span>
                    <button className="btn-outline px-4 py-2 text-sm" onClick={() => toggleGoalCompletion(goal)}>{goal.completed ? "Undo" : "Complete"}</button>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No goals set yet.</p>}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Recipes</h2>
          <form action={handleRecipe} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Recipe name" required />
              <input name="description" placeholder="Description" required />
              <input name="itemName" placeholder="Ingredient / food item" required />
              <input name="itemQuantity" placeholder="Quantity" required />
              <input name="itemCalories" type="number" placeholder="Calories" min={0} required />
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="shared" className="h-4 w-4 rounded border-slate-300" /> Share recipe with friends
            </label>
            <button className="btn-primary max-w-fit" disabled={saving}>Create recipe</button>
          </form>
          <div className="mt-6 space-y-3">
            {recipes.length ? recipes.map((recipe) => (
              <div key={recipe.id} className="surface">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{recipe.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{recipe.description}</div>
                    <div className="mt-2 text-sm text-slate-700">{recipe.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}</div>
                    <div className="mt-2 text-xs text-slate-500">{recipe.shared ? "Shared with friends" : "Private recipe"} • {formatDate(recipe.createdAt)}</div>
                  </div>
                  <button className="btn-outline px-4 py-2 text-sm" onClick={() => deleteRecipe(recipe)}>Delete</button>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No recipes created yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <article className="card p-6">
          <h2 className="section-title">Social sharing</h2>
          <p className="mt-2 text-sm text-slate-600">Friends can share workouts, goals, recipes, and data chart wins.</p>
          <div className="mt-4 space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="surface">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{post.author}</div>
                    <div className="text-sm text-slate-600">{post.kind} share • {formatDateTime(post.createdAt)}</div>
                  </div>
                  <span className="badge">{post.kind}</span>
                </div>
                <p className="mt-3 text-sm text-slate-700">{post.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Health summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="kpi"><div className="text-sm text-slate-500">Calories consumed</div><div className="mt-2 text-2xl font-bold">{meals.reduce((sum, meal) => sum + meal.calories, 0)}</div></div>
            <div className="kpi"><div className="text-sm text-slate-500">Calories burned</div><div className="mt-2 text-2xl font-bold">{totalCaloriesBurned}</div></div>
            <div className="kpi"><div className="text-sm text-slate-500">Protein total</div><div className="mt-2 text-2xl font-bold">{meals.reduce((sum, meal) => sum + meal.protein, 0)}g</div></div>
            <div className="kpi"><div className="text-sm text-slate-500">Recipes shared</div><div className="mt-2 text-2xl font-bold">{recipes.filter((recipe) => recipe.shared).length}</div></div>
          </div>
        </article>
      </section>
    </main>
  );
}
