import { useState } from "react";
import WorkoutLogger from "./workoutLogger";
import NutritionLogger from "./nutritionLogger";

export default function Dashboard({ user, onLogout }) {
  const [view, setView] = useState("menu");

  return (
    <div className="bg-blue-900 p-6 rounded-2xl shadow-md w-full max-w-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user}!</h1>
        {/* Logout button*/}
        <button
          className="bg-red-500 text-black px-3 py-1 rounded text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
{/* Menu view with buttons to navigate to each feature*/}
      {view === "menu" && (
        <div className="space-y-4">
          <button
            className="w-full bg-white text-black p-3 rounded transition-transform duration-200 hover:scale-105 active:scale-95 cursor-default"
            onClick={() => setView("workout")}
          >
            Workout Logger
          </button>

          <button
            className="w-full bg-white text-black p-3 rounded transition-transform duration-200 hover:scale-105 active:scale-95 cursor-default"
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