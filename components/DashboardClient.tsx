"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LineChart } from "./LineChart";
import type { DashboardData, Goal, GoalCategory, Meal, MealType, PublicUser, Recipe, SharePost, UserProfile, Workout, WorkoutType } from "@/lib/types";
import { buildChartSeries, formatDate, formatDateTime, generateId } from "@/lib/utils";
import { ACHIEVEMENTS } from "@/lib/mock-data";

type Props = DashboardData & { firebaseEnabled: boolean };

type Metric = "weeklyCalories" | "weeklyCarbs" | "weeklyProtein" | "weeklyFat" | "weeklyWorkoutMinutes";

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

type RecipeSearchResult = {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  source?: string;
};

const metricLabels: Record<Metric, string> = {
  weeklyCalories: "Weekly calorie intake",
  weeklyCarbs: "Weekly carbs intake",
  weeklyProtein: "Weekly protein intake",
  weeklyFat: "Weekly fat intake",
  weeklyWorkoutMinutes: "Weekly time spent working out",
};

export function DashboardClient({ profile, meals: initialMeals, workouts: initialWorkouts, goals: initialGoals, recipes: initialRecipes, posts: initialPosts, users }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeProfile, setActiveProfile] = useState<UserProfile>(profile);
  const [meals, setMeals] = useState(initialMeals);
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [goals, setGoals] = useState(initialGoals);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [posts, setPosts] = useState(initialPosts);
  const [allUsers] = useState<PublicUser[]>(users || []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [exerciseResults, setExerciseResults] = useState<ExerciseSearchResult[]>([]);
  const [recipeResults, setRecipeResults] = useState<RecipeSearchResult[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<Metric>("weeklyCalories");
  const [shareKind, setShareKind] = useState<SharePost["kind"]>("workout");
  const [friendQuery, setFriendQuery] = useState("");

  const adminDenied = searchParams.get("denied") === "1";

  const availableFriends = useMemo(
    () => allUsers.filter((user) => user.email !== activeProfile.email && !activeProfile.friends.includes(user.email)),
    [allUsers, activeProfile.email, activeProfile.friends],
  );

  const filteredFriendResults = useMemo(() => {
    const query = friendQuery.trim().toLowerCase();
    if (!query) return availableFriends.slice(0, 6);
    return availableFriends.filter((user) => user.name.toLowerCase().includes(query)).slice(0, 6);
  }, [availableFriends, friendQuery]);

  const friendProfiles = useMemo(
    () => allUsers.filter((user) => activeProfile.friends.includes(user.email)),
    [allUsers, activeProfile.friends],
  );

  const chartData = useMemo(() => {
    return buildChartSeries(meals, workouts).map((item) => ({ label: item.label, value: item[selectedMetric] }));
  }, [meals, workouts, selectedMetric]);

  const completedGoals = goals.filter((goal) => goal.completed).length;
  const totalWorkoutMinutes = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const totalCaloriesConsumed = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

  const completedAchievements = ACHIEVEMENTS.filter((item) => activeProfile.achievements.includes(item.title));
  const incompleteAchievements = ACHIEVEMENTS.filter((item) => !activeProfile.achievements.includes(item.title));

  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Request failed.");
      return data;
    } catch (caught) {
      const nextMessage = caught instanceof Error ? caught.message : "Something went wrong.";
      setError(nextMessage);
      throw caught;
    } finally {
      setSaving(false);
    }
  }

  function applyAchievementUpdate(updatedProfile?: UserProfile) {
    if (updatedProfile) setActiveProfile(updatedProfile);
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
      description: String(formData.get("description") || ""),
      performedAt: new Date().toISOString(),
    };
    const data = await request<{ item: Workout; profile?: UserProfile; notification?: string | null }>("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setWorkouts([data.item, ...workouts]);
    applyAchievementUpdate(data.profile);
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
    const data = await request<{ item: Meal; profile?: UserProfile; notification?: string | null }>("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMeals([data.item, ...meals]);
    applyAchievementUpdate(data.profile);
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
  }

  async function toggleGoalCompletion(goal: Goal) {
    const payload = { ...goal, completed: !goal.completed };
    const data = await request<{ item: Goal }>(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setGoals(goals.map((item) => (item.id === goal.id ? data.item : item)));
  }

  async function saveRecipeFromSearch(result: RecipeSearchResult) {
    const payload: Recipe = {
      id: generateId("recipe"),
      name: result.name,
      description: result.description,
      items: result.ingredients.map((ingredient) => ({
        name: ingredient,
        quantity: "1",
        calories: 0,
      })),
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      createdAt: new Date().toISOString(),
      shared: false,
    };
    const data = await request<{ item: Recipe }>("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setRecipes([data.item, ...recipes]);
  }

  async function deleteRecipe(recipe: Recipe) {
    await request(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    setRecipes(recipes.filter((item) => item.id !== recipe.id));
  }

  async function addFriend(friendEmail: string) {
    const email = friendEmail;
    const data = await request<{ item: UserProfile }>("/api/social/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setActiveProfile(data.item);
    setFriendQuery("");
  }

  async function shareItem(formData: FormData) {
    const kind = String(formData.get("kind")) as SharePost["kind"];
    const selectedId = String(formData.get("selectedId") || "");

    const text = kind === "goal"
      ? (() => {
          const goal = goals.find((item) => item.id === selectedId);
          return goal ? `Shared a goal: ${goal.title} — ${goal.target}` : "";
        })()
      : kind === "recipe"
        ? (() => {
            const recipe = recipes.find((item) => item.id === selectedId);
            return recipe ? `Shared a recipe: ${recipe.name} — ${recipe.description}` : "";
          })()
        : (() => {
            const workout = workouts.find((item) => item.id === selectedId);
            return workout ? `Shared a workout: ${workout.exercise} for ${workout.duration || 0} minutes` : "";
          })();

    if (!text) {
      setError("Pick an item to share.");
      return;
    }

    const data = await request<{ item: SharePost }>("/api/social/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: generateId("share"), kind, text, createdAt: new Date().toISOString(), author: activeProfile.name }),
    });
    setPosts([data.item, ...posts]);
  }

  async function searchFoods(formData: FormData) {
    const query = String(formData.get("query") || "");
    const data = await request<{ items: FoodSearchResult[] }>(`/api/search/foods?q=${encodeURIComponent(query)}`);
    setFoodResults(data.items || []);
  }

  async function searchExercises(formData: FormData) {
    const query = String(formData.get("query") || "");
    const data = await request<{ items: ExerciseSearchResult[] }>(`/api/search/exercises?q=${encodeURIComponent(query)}`);
    setExerciseResults(data.items || []);
  }

  async function searchRecipes(formData: FormData) {
    const query = String(formData.get("query") || "");
    const data = await request<{ items: RecipeSearchResult[] }>(`/api/search/recipes?q=${encodeURIComponent(query)}`);
    setRecipeResults(data.items || []);
  }

  async function saveWorkoutFromSearch(exercise: ExerciseSearchResult) {
    const payload: Workout = {
      id: generateId("workout"),
      type: exercise.bodyPart === "cardio" ? "cardio" : "strength",
      exercise: exercise.name,
      duration: undefined,
      description: `${exercise.bodyPart} • ${exercise.target} • ${exercise.equipment}`,
      performedAt: new Date().toISOString(),
    };
    const data = await request<{ item: Workout; profile?: UserProfile; notification?: string | null }>("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setWorkouts([data.item, ...workouts]);
    applyAchievementUpdate(data.profile);
  }

  async function saveFoodFromSearch(food: FoodSearchResult) {
    const payload: Meal = {
      id: generateId("meal"),
      name: food.food_name,
      quantity: "1 serving",
      calories: Number(food.nf_calories || 0),
      protein: Number(food.nf_protein || 0),
      carbs: Number(food.nf_total_carbohydrate || 0),
      fat: Number(food.nf_total_fat || 0),
      mealType: "lunch",
      loggedAt: new Date().toISOString(),
    };
    const data = await request<{ item: Meal; profile?: UserProfile; notification?: string | null }>("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMeals([data.item, ...meals]);
    applyAchievementUpdate(data.profile);
  }

  const shareableItems = shareKind === "goal" ? goals : shareKind === "recipe" ? recipes : workouts;


  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Healthify dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-950">Welcome back, {activeProfile.name}</h1>
          <p className="mt-2 text-slate-600">Track workouts, nutrition, goals, streaks, recipes, friends, and achievements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge">Streak: {activeProfile.dailyStreak} days</span>
          <span className="badge">Role: {activeProfile.role}</span>
          {activeProfile.role === "admin" && <Link href="/dashboard/admin" className="btn-outline">Admin panel</Link>}
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      {adminDenied && <div className="alert-error mb-6">Admin access is restricted to users with the admin role.</div>}
      {error && <div className="alert-error mb-6">{error}</div>}

      <section className="card p-6 mb-8">
        <h2 className="section-title">Your progress</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="kpi"><div className="text-sm text-slate-500">Current weight</div><div className="mt-2 text-2xl font-bold">{activeProfile.currentWeight} lb</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Workout minutes</div><div className="mt-2 text-2xl font-bold">{totalWorkoutMinutes}</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Goals completed</div><div className="mt-2 text-2xl font-bold">{completedGoals}/{goals.length}</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Carb total</div><div className="mt-2 text-2xl font-bold">{totalCarbs}g</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Fat total</div><div className="mt-2 text-2xl font-bold">{totalFat}g</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Calories consumed</div><div className="mt-2 text-2xl font-bold">{totalCaloriesConsumed}</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Protein total</div><div className="mt-2 text-2xl font-bold">{totalProtein}g</div></div>
          <div className="kpi"><div className="text-sm text-slate-500">Workouts logged</div><div className="mt-2 text-2xl font-bold">{workouts.length}</div></div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <article className="card p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="section-title">Progress visualization</h2>
            <select value={selectedMetric} onChange={(event) => setSelectedMetric(event.target.value as Metric)} className="max-w-72" aria-label="Chart metric selector">
              {Object.entries(metricLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <LineChart data={chartData} />
          <p className="mt-4 text-sm text-slate-600">Showing {metricLabels[selectedMetric].toLowerCase()} across the last 7 days.</p>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Profile settings</h2>
          <form action={handleProfileUpdate} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3 sm:items-start">
              <div className="flex flex-col">
                <label htmlFor="currentWeight" className="label min-h-[20px]">Current weight</label>
                <input id="currentWeight" name="currentWeight" type="number" min={1} defaultValue={activeProfile.currentWeight} required />
              </div>
              <div className="flex flex-col">
                <label htmlFor="goalCalories" className="label min-h-[20px]">Calorie goal</label>
                <input id="goalCalories" name="goalCalories" type="number" min={1} defaultValue={activeProfile.goalCalories} required />
              </div>
              <div className="flex flex-col">
                <label htmlFor="goalWorkoutsPerWeek" className="label min-h-[20px]">Workout goal</label>
                <input id="goalWorkoutsPerWeek" name="goalWorkoutsPerWeek" type="number" min={1} defaultValue={activeProfile.goalWorkoutsPerWeek} required />
              </div>
            </div>
            <button className="btn-primary max-w-fit" disabled={saving}>Save profile</button>
          </form>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Achievements completed</h3>
            {completedAchievements.length ? completedAchievements.map((achievement) => (
              <div key={achievement.id} className="surface text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{achievement.title}</div>
                <div>{achievement.description}</div>
              </div>
            )) : <p className="text-sm text-slate-600">No achievements completed yet.</p>}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Achievements in progress</h3>
            {incompleteAchievements.length ? incompleteAchievements.map((achievement) => (
              <div key={achievement.id} className="surface text-sm text-slate-700">
                <div className="font-semibold text-slate-900">{achievement.title}</div>
                <div>{achievement.description}</div>
              </div>
            )) : <p className="text-sm text-slate-600">All achievements completed.</p>}
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Friends</h3>
            <div className="flex flex-col gap-3">
              <input
                value={friendQuery}
                onChange={(event) => setFriendQuery(event.target.value)}
                className="flex-1"
                aria-label="Search for a friend by name"
                placeholder="Search for an existing user by name"
              />
              <div className="space-y-2">
                {filteredFriendResults.length ? filteredFriendResults.map((user) => (
                  <div key={user.id} className="surface flex items-center justify-between gap-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">{user.name}</span>
                    <button
                      type="button"
                      className="btn-secondary px-4 py-2 text-sm"
                      disabled={saving}
                      onClick={() => addFriend(user.email)}
                    >
                      Add friend
                    </button>
                  </div>
                )) : <p className="text-sm text-slate-600">No matching users found.</p>}
              </div>
            </div>
            {friendProfiles.length ? friendProfiles.map((friend) => (
              <div key={friend.id} className="surface text-sm text-slate-700">{friend.name}</div>
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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{exercise.name}</div>
                    <div className="mt-1 text-slate-600">{exercise.bodyPart} • {exercise.target} • {exercise.equipment}</div>
                  </div>
                  <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => saveWorkoutFromSearch(exercise)}>Save</button>
                </div>
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
                  <div className="text-sm text-slate-700">{workout.duration || 0} min</div>
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
              <input name="protein" type="number" placeholder="Protein (g)" min={0} required />
              <input name="carbs" type="number" placeholder="Carbs (g)" min={0} required />
              <input name="fat" type="number" placeholder="Fat (g)" min={0} required />
              <select name="mealType" defaultValue="lunch" aria-label="Meal type"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select>
            </div>
            <button className="btn-primary max-w-fit" disabled={saving}>Save meal</button>
          </form>

          <form action={searchFoods} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input name="query" placeholder="Search foods" aria-label="Food search" />
            <button className="btn-secondary sm:w-auto">Search</button>
          </form>

          <div className="mt-4 space-y-3">
            {foodResults.length ? foodResults.slice(0, 8).map((food) => (
              <div key={food.food_name} className="surface text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold capitalize text-slate-900">{food.food_name}</div>
                    <div className="mt-1 text-slate-600">{food.nf_calories} kcal • P {food.nf_protein} • C {food.nf_total_carbohydrate} • F {food.nf_total_fat}</div>
                  </div>
                  <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => saveFoodFromSearch(food)}>Save</button>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">Search from the built-in nutrition list.</p>}
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
                    <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => toggleGoalCompletion(goal)}>{goal.completed ? "Undo" : "Complete"}</button>
                  </div>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No goals set yet.</p>}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Recipes</h2>
          <form action={searchRecipes} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input name="query" placeholder="Search recipes" aria-label="Recipe search" />
            <button className="btn-secondary sm:w-auto">Search</button>
          </form>
          <div className="mt-4 space-y-3">
            {recipeResults.length ? recipeResults.slice(0, 6).map((recipe) => (
              <div key={recipe.id} className="surface text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{recipe.name}</div>
                    <div className="mt-1 text-slate-600">{recipe.ingredients.join(", ")}</div>
                    <div className="mt-1 text-slate-600">{recipe.calories} kcal • P {recipe.protein} • C {recipe.carbs} • F {recipe.fat}</div>
                  </div>
                  <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => saveRecipeFromSearch(recipe)}>Save</button>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">Search recipes to load names, ingredients, and nutrition estimates.</p>}
          </div>
          <div className="mt-6 space-y-3">
            {recipes.length ? recipes.map((recipe) => (
              <div key={recipe.id} className="surface">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{recipe.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{recipe.description}</div>
                    <div className="mt-2 text-sm text-slate-700">{recipe.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}</div>
                    <div className="mt-2 text-sm text-slate-600">{recipe.calories || 0} kcal • P {recipe.protein || 0}g • C {recipe.carbs || 0}g • F {recipe.fat || 0}g</div>
                    <div className="mt-2 text-xs text-slate-500">{formatDate(recipe.createdAt)}</div>
                  </div>
                  <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => deleteRecipe(recipe)}>Delete</button>
                </div>
              </div>
            )) : <p className="text-sm text-slate-600">No recipes saved yet.</p>}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <article className="card p-6">
          <h2 className="section-title">Social sharing</h2>
          <p className="mt-2 text-sm text-slate-600">New accounts start empty. Add friends, then share workouts, goals, or recipes with them.</p>
          <form action={shareItem} className="mt-4 grid gap-3 sm:grid-cols-2">
            <select name="kind" value={shareKind} onChange={(event) => setShareKind(event.target.value as SharePost["kind"])} aria-label="Share type">
              <option value="workout">Workout</option>
              <option value="goal">Goal</option>
              <option value="recipe">Recipe</option>
            </select>
            <select name="selectedId" defaultValue="" aria-label="Item to share">
              <option value="" disabled>Select an item to share</option>
              {shareKind === "workout" && workouts.map((item) => <option key={item.id} value={item.id}>Workout: {item.exercise}</option>)}
              {shareKind === "goal" && goals.map((item) => <option key={item.id} value={item.id}>Goal: {item.title}</option>)}
              {shareKind === "recipe" && recipes.map((item) => <option key={item.id} value={item.id}>Recipe: {item.name}</option>)}
            </select>
            <button className="btn-primary sm:col-span-2 max-w-fit" disabled={saving || !activeProfile.friends.length || !shareableItems.length}>Share with friends</button>
          </form>
          <div className="mt-4 space-y-3">
            {posts.length ? posts.map((post) => (
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
            )) : <p className="text-sm text-slate-600">No shares yet. Add friends and share your first goal, recipe, or workout.</p>}
          </div>
        </article>

        <article className="card p-6">
          <h2 className="section-title">Achievement list</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-900">Complete</h3>
              <div className="mt-3 space-y-3">
                {completedAchievements.length ? completedAchievements.map((achievement) => (
                  <div key={achievement.id} className="surface text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">{achievement.title}</div>
                    <div>{achievement.description}</div>
                  </div>
                )) : <p className="text-sm text-slate-600">No completed achievements yet.</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Incomplete</h3>
              <div className="mt-3 space-y-3">
                {incompleteAchievements.length ? incompleteAchievements.map((achievement) => (
                  <div key={achievement.id} className="surface text-sm text-slate-700">
                    <div className="font-semibold text-slate-900">{achievement.title}</div>
                    <div>{achievement.description}</div>
                  </div>
                )) : <p className="text-sm text-slate-600">All achievements complete.</p>}
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
