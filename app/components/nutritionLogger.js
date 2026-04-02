import { useState } from "react";

export default function NutritionLogger({ goBack }) {
  const foods = {
    // approximate calories per gram also temp until api is implemented
    Rice: 1.3,    
    Chicken: 2.4,
    Beef: 2.5,
  };

  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [grams, setGrams] = useState("");
  const [entries, setEntries] = useState([]);
//saves the food entry to the list of entries and resets the input
  const saveFood = () => {
    if (!grams) return;

    const calories = grams * foods[selected];

    setEntries([
      ...entries,
      { name: selected, grams, calories: calories.toFixed(1) },
    ]);

    setGrams("");
    setView("list");
  };
//back button
  return (
    <div>
      <button onClick={goBack} className="mb-3 p-2 bg-blue-500 text-white rounded cursor-pointer">
        ← Back
      </button>

      <h2 className="text-lg font-semibold mb-3">Nutrition Logger</h2>
{/*list of foods, on click goes to detail view to log grams, also shows saved entries */}
      {view === "list" && (
        <>
          {Object.keys(foods).map((food, i) => (
            <div
              key={i}
              className="p-2 mb-2 cursor-pointer bg-blue-500 text-white rounded"
              onClick={() => {
                setSelected(food);
                setView("detail");
              }}
            >
              {food}
            </div>
          ))}

          <h3 className="mt-4 font-semibold">Saved Foods</h3>
          {entries.map((e, i) => (
            <div key={i} className="border-b py-1">
              {e.grams}g of {e.name}: {e.calories} cals
            </div>
          ))}
        </>
      )}

      {view === "detail" && (
        <div className="space-y-3">
          <h3 className="font-semibold">{selected}</h3>

          <input
            className="border p-2 w-full"
            placeholder="Grams"
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
          />

          <button
            className="bg-blue-500 text-white rounded p-2 w-full cursor-pointer"
            onClick={saveFood}
          >
            Save Food
          </button>
        </div>
      )}
    </div>
  );
}