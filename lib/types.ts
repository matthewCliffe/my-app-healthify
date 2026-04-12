export type Role = "user" | "admin";

export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  currentWeight: number;
  dailyStreak: number;
  achievements: string[];
  friends: string[];
  dailyCaloricIntake: number;
  weeklyCaloricIntake: number;
  goalCalories: number;
  goalWorkoutsPerWeek: number;
  joinedAt: string;
  lastLoginDate?: string;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
};

export type GoalCategory = "nutrition" | "fitness" | "weight" | "habit";

export type Goal = {
  id: string;
  title: string;
  target: string;
  category: GoalCategory;
  completed: boolean;
  createdAt: string;
};

export type WorkoutType = "strength" | "cardio" | "custom";

export type Workout = {
  id: string;
  type: WorkoutType;
  exercise: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  caloriesBurned?: number;
  description?: string;
  performedAt: string;
};

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  loggedAt: string;
};

export type RecipeItem = { name: string; quantity: string; calories: number };

export type Recipe = {
  id: string;
  name: string;
  description: string;
  items: RecipeItem[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: string;
  shared: boolean;
};

export type SharePost = {
  id: string;
  author: string;
  authorEmail?: string;
  kind: "workout" | "recipe" | "goal";
  text: string;
  createdAt: string;
};

export type DashboardData = {
  profile: UserProfile;
  meals: Meal[];
  workouts: Workout[];
  goals: Goal[];
  recipes: Recipe[];
  posts: SharePost[];
  users: PublicUser[];
};

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
};
