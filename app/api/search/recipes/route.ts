import { NextResponse } from "next/server";
import { sampleFoods } from "@/lib/mock-data";

type MealDbRecipe = {
  idMeal: string;
  strMeal: string;
  strCategory?: string;
  strInstructions?: string;
  [key: string]: string | undefined;
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

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function estimateNutrition(ingredients: string[]) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;

  for (const ingredient of ingredients) {
    const name = normalize(ingredient);
    const match = sampleFoods.find((food) => {
      const foodName = normalize(String(food.food_name));
      return name.includes(foodName) || foodName.includes(name);
    });

    if (match) {
      calories += Number(match.nf_calories || 0);
      protein += Number(match.nf_protein || 0);
      carbs += Number(match.nf_total_carbohydrate || 0);
      fat += Number(match.nf_total_fat || 0);
    }
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}

function mapMealDbRecipe(recipe: MealDbRecipe): RecipeSearchResult {
  const ingredients = Array.from({ length: 20 }, (_, index) => recipe[`strIngredient${index + 1}`]?.trim())
    .filter((value): value is string => Boolean(value));
  const nutrition = estimateNutrition(ingredients);

  return {
    id: recipe.idMeal,
    name: recipe.strMeal,
    ingredients,
    description: recipe.strCategory || recipe.strInstructions?.slice(0, 140) || "Recipe result",
    ...nutrition,
    source: "themealdb",
  };
}

function getFallbackRecipes(query: string): RecipeSearchResult[] {
  const fallback = [
    {
      id: "demo-chicken-rice-bowl",
      name: "Chicken Rice Bowl",
      ingredients: ["grilled chicken breast", "brown rice", "broccoli"],
      description: "Simple high-protein bowl.",
    },
    {
      id: "demo-salmon-plate",
      name: "Salmon Plate",
      ingredients: ["salmon", "sweet potato", "spinach"],
      description: "Balanced dinner plate.",
    },
    {
      id: "demo-oatmeal-bowl",
      name: "Oatmeal Bowl",
      ingredients: ["rolled oats", "banana", "greek yogurt"],
      description: "Fast breakfast recipe.",
    },
  ];

  return fallback
    .filter((item) => !query || normalize(item.name).includes(normalize(query)))
    .map((item) => ({ ...item, ...estimateNutrition(item.ingredients), source: "fallback" }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  try {
    const query = q || "chicken";
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });

    if (response.ok) {
      const data = (await response.json()) as { meals?: MealDbRecipe[] | null };
      const items = (data.meals || []).slice(0, 8).map(mapMealDbRecipe);
      if (items.length) {
        return NextResponse.json({ items, source: "themealdb" });
      }
    }
  } catch {
  }

  return NextResponse.json({ items: getFallbackRecipes(q), source: "fallback" });
}
