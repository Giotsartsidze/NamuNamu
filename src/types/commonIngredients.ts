import Fuse from 'fuse.js';

export type IngredientItem = {
	name: string;
	icon: string;
};

export const commonIngredients: IngredientItem[] = [
	{ name: 'apple', icon: '🍎' },
	{ name: 'banana', icon: '🍌' },
	{ name: 'tomato', icon: '🍅' },
	{ name: 'onion', icon: '🧅' },
	{ name: 'garlic', icon: '🧄' },
	{ name: 'potato', icon: '🥔' },
	{ name: 'carrot', icon: '🥕' },
	{ name: 'broccoli', icon: '🥦' },
	{ name: 'spinach', icon: '🥬' },
	{ name: 'bell pepper', icon: '🫑' },
	{ name: 'cucumber', icon: '🥒' },
	{ name: 'lemon', icon: '🍋' },
	{ name: 'lime', icon: '🟢' },
	{ name: 'strawberry', icon: '🍓' },
	{ name: 'avocado', icon: '🥑' },
	{ name: 'mushroom', icon: '🍄' },
	{ name: 'ginger', icon: '🫚' },
	{ name: 'celery', icon: '🥬' },
	{ name: 'corn', icon: '🌽' },
	{ name: 'grapes', icon: '🍇' },
	{ name: 'orange', icon: '🍊' },
	{ name: 'pineapple', icon: '🍍' },

	{ name: 'chicken breast', icon: '🍗' },
	{ name: 'ground beef', icon: '🥩' },
	{ name: 'salmon fillet', icon: '🐟' },
	{ name: 'pork chop', icon: '🍖' },
	{ name: 'bacon', icon: '🥓' },
	{ name: 'sausage', icon: '🌭' },
	{ name: 'tuna (canned)', icon: '🐟' },
	{ name: 'tofu', icon: '⬜' },
	{ name: 'shrimp', icon: '🦐' },

	{ name: 'milk', icon: '🥛' },
	{ name: 'egg', icon: '🥚' },
	{ name: 'butter', icon: '🧈' },
	{ name: 'cheddar cheese', icon: '🧀' },
	{ name: 'mozzarella cheese', icon: '🧀' },
	{ name: 'yogurt', icon: '🍦' },
	{ name: 'heavy cream', icon: '🥛' },

	{ name: 'rice', icon: '🍚' },
	{ name: 'flour', icon: '🍚' },
	{ name: 'pasta', icon: '🍝' },
	{ name: 'bread', icon: '🍞' },
	{ name: 'oats', icon: '🥣' },
	{ name: 'sugar', icon: '🍚' },
	{ name: 'baking soda', icon: '🥄' },
	{ name: 'baking powder', icon: '🥄' },

	{ name: 'black beans', icon: '🫘' },
	{ name: 'lentils', icon: '🫘' },
	{ name: 'peanut butter', icon: '🥜' },
	{ name: 'almonds', icon: '🌰' },
	{ name: 'chickpeas', icon: '🫘' },

	{ name: 'olive oil', icon: '🍾' },
	{ name: 'vegetable oil', icon: '🍾' },
	{ name: 'salt', icon: '🧂' },
	{ name: 'black pepper', icon: '🧂' },
	{ name: 'soy sauce', icon: '🍶' },
	{ name: 'ketchup', icon: '🥫' },
	{ name: 'mustard', icon: '🟡' },
	{ name: 'vinegar', icon: '🍾' },
	{ name: 'honey', icon: '🍯' },

	{ name: 'oregano', icon: '🌿' },
	{ name: 'basil', icon: '🌿' },
	{ name: 'thyme', icon: '🌿' },
	{ name: 'cumin', icon: '🌶️' },
	{ name: 'paprika', icon: '🌶️' },
	{ name: 'chili powder', icon: '🌶️' },
	{ name: 'cinnamon', icon: '🪵' },
];

export const fuse = new Fuse(commonIngredients, {
	keys: ['name'],
	threshold: 0.3,
	ignoreLocation: true,
});