import { writable, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define the shape of our stored data
export interface Recipe {
	id: number;
	title: string;
	content: string; // The full Markdown content of the recipe
	timestamp: number;
	reminderTime: string | null;
	reminderIntervalId: any | null;
}




// 1. Load initial data from Local Storage
const initialRecipes: Recipe[] = browser
	? JSON.parse(localStorage.getItem('favoriteRecipes') || '[]')
	: [];

// 2. Create the Writable store
export const favoriteRecipes: Writable<Recipe[]> = writable(initialRecipes);

// 3. Subscribe to the store and save any changes to Local Storage
if (browser) {
	favoriteRecipes.subscribe((recipes) => {
		// This runs whenever the store content changes
		localStorage.setItem('favoriteRecipes', JSON.stringify(recipes));
	});
}

// 4. Action functions to modify the store
export function addFavorite(content: string) {
	// Attempt to extract the title from the first line of the content
	const match = content.match(/^#?\s*Recipe Title:\s*(.*)/m);
	const title = match ? match[1].trim() : `Untitled Recipe ${Date.now()}`;

	const newRecipe: Recipe = {
		id: Date.now(), // Use timestamp as a simple unique ID for the hackathon
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
		// 💡 Stop the interval before removing the recipe
		if (recipeToRemove && recipeToRemove.reminderIntervalId) {
			clearInterval(recipeToRemove.reminderIntervalId);
		}
		return recipes.filter((recipe) => recipe.id !== id);
	});
}


export function toggleRecipeReminder(id: number, time: string) {
	if (!('Notification' in window)) {
		alert('Your browser does not support notifications.');
		return;
	}

	// Request permission if not already granted
	if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
		Notification.requestPermission();
	}

	if (Notification.permission !== 'granted') {
		alert('Please grant notification permission to set a reminder.');
		return;
	}

	favoriteRecipes.update((recipes) => {
		return recipes.map((recipe) => {
			if (recipe.id === id) {
				// If a reminder is already active, stop it
				if (recipe.reminderIntervalId) {
					clearInterval(recipe.reminderIntervalId);
					return { ...recipe, reminderTime: null, reminderIntervalId: null };
				}

				// Else, set a new reminder
				const [hours, minutes] = time.split(':').map(Number);

				const checkTime = () => {
					const now = new Date();

					// 💡 CRITICAL: Ensure the comparison is done correctly based on the current minute
					// The strict comparison of hours AND minutes is correct.
					if (now.getHours() === hours && now.getMinutes() === minutes) {
						// --- This is the action that should fire ---
						new Notification(`🍽️ Meal Reminder: ${recipe.title}`, {
							body: `It's time to cook your saved recipe!`,
							icon: '/favicon.ico'
						});

						// 💡 Recommendation: Log this event to the console so you know it FIRED
						console.log(`Notification fired for: ${recipe.title} at ${time}`);
					}
				};

				// Start the interval and save its ID
				const intervalId = setInterval(checkTime, 60000); // Check every minute
				checkTime(); // Check immediately

				return { ...recipe, reminderTime: time, reminderIntervalId: intervalId };
			}
			return recipe;
		});
	});
}