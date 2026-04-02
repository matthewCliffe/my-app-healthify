import { useState } from "react";
import WorkoutLogger from "./workoutLogger";
import NutritionLogger from "./nutritionLogger";

export default function Dashboard({ user }) {
  const [view, setView] = useState("menu");

  return (
    <div className="bg-green-500 p-6 rounded-2xl shadow-md w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user}</h1>

      {view === "menu" && (
        <div className="space-y-4">
          <button
            className="w-full bg-blue-500 text-white p-3 rounded"
            onClick={() => setView("workout")}
          >
            Workout Logger
          </button>

          <button
            className="w-full bg-blue-500 text-white p-3 rounded"
            onClick={() => setView("nutrition")}
          >
            Nutrition Logger
          </button>
        </div>
      )}

      {view === "workout" && (
        <WorkoutLogger goBack={() => setView("menu")} />
      )}

      {view === "nutrition" && (
        <NutritionLogger goBack={() => setView("menu")} />
      )}
    </div>
  );
}