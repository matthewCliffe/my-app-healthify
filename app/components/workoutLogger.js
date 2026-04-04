import { useState } from "react";

export default function WorkoutLogger({ goBack }) {
  const exercises = ["Push Ups", "Squats", "Sit Ups"];//temp example exercises eventually api call to get exercises
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  //temp save function, saves workouts to array
  const saveWorkout = () => {
    if (!reps || !sets) return;

    setSavedWorkouts([
      ...savedWorkouts,
      { name: selected, reps, sets },
    ]);

    setReps("");
    setSets("");
    setView("list");
  };

//back button
  return (
    <div>
      <button onClick={goBack} className="mb-3 p-2 bg-blue-500 text-white rounded cursor-pointer">
        ← Back
      </button>

      <h2 className="text-lg font-semibold mb-3">Workout Logger</h2>
{/*list of exercises, on click goes to detail view to log sets and reps, also shows saved workouts */}
      {view === "list" && (
        <>
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="p-2 mb-2 cursor-pointer bg-blue-500 text-white rounded"
              onClick={() => {
                setSelected(ex);
                setView("detail");
              }}
            >
              {ex}
            </div>
          ))}

          <h3 className="mt-4 font-semibold ">Saved Workouts</h3>
          {savedWorkouts.map((w, i) => (
            <div key={i} className="border-b py-1">
              {w.name}: {w.sets} sets x {w.reps} reps
            </div>
          ))}
        </>
      )}

      {view === "detail" && (
        <div className="space-y-3">
          <h3 className="font-semibold">{selected}</h3>

          <input
            className="border p-2 w-full"
            placeholder="Sets"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
          />

          <input
            className="border p-2 w-full"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />

          <button
            className="bg-blue-500 text-white rounded p-2 w-full cursor-pointer"
            onClick={saveWorkout}
          >
            Save Workout
          </button>
        </div>
      )}
    </div>
  );
}