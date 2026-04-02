import { useState } from "react";
import WorkoutLogger from "./workoutLogger";
import NutritionLogger from "./nutritionLogger";

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("menu");

  return (
    <div className="bg-green-500 p-6 rounded-2xl shadow-md w-full max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user}</h1>
        {/* Logout button*/}
        <button
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
{/* Menu view with buttons to navigate to each feature*/}
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
{/* Set page back to menu when back button is pressed */}
      {view === "workout" && (
        <WorkoutLogger goBack={() => setView("menu")} />
      )}

      {view === "nutrition" && (
        <NutritionLogger goBack={() => setView("menu")} />
      )}
    </div>
  );
}