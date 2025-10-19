import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface Recipe {
	id: number;
	title: string;
	content: string;
	timestamp: number;
	reminderTime: string | null;
	reminderIntervalId: any | null;
}

const initialRecipes: Recipe[] = browser
	? JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')
	: [];

export const favoriteRecipes: Writable<Recipe[]> = writable(initialRecipes);

if (browser) {
	favoriteRecipes.subscribe((recipes) => {
		localStorage.setItem('favoriteRecipes', JSON.stringify(recipes));
	});
}

export function addFavorite(content: string) {
	const match = content.match(/^#?\s*Recipe Title:\s*(.*)/m);
	const title = match ? match[1].trim() : `Untitled Recipe ${Date.now()}`;

	const newRecipe: Recipe = {
		id: Date.now(),
		title: title,
		content: content,
		timestamp: Date.now(),
		reminderTime: null,
		reminderIntervalId: null,
	};

	favoriteRecipes.update((recipes) => [...recipes, newRecipe]);
}

export function removeFavorite(id: number) {
	favoriteRecipes.update((recipes) => {
		const recipeToRemove = recipes.find(r => r.id === id);
		if (recipeToRemove && recipeToRemove.reminderIntervalId) {
			clearInterval(recipeToRemove.reminderIntervalId);
		}
		return recipes.filter((recipe) => recipe.id !== id);
	});
}


