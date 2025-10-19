export interface Ingredient {
	name: string;
	quantity: string; // e.g., "1 cup", "2 cloves", "to taste"
}

export interface StructuredRecipe {
	title: string;
	description: string;
	prepTime: string;
	cookTime: string;
	servings: number;
	ingredients: Ingredient[];
	steps: string[];
	estimatedCalories: number;
	disclaimer: string;
}

