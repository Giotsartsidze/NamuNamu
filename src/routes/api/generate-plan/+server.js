import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

export async function POST({ request }) {
	const { ingredients, dietaryRestrictions, medicalConditions, targetWeight,
		targetTimeframe  } = await request.json();

	if (!ingredients || !Array.isArray(ingredients)) {
		return new Response('Missing or malformed ingredients list.', { status: 400 });
	}

	const healthConstraints = [dietaryRestrictions, medicalConditions]
		.filter(c => c && c.trim() !== '')
		.join('; ');

	const userIngredients = ingredients.join(', ');

	const goalPrompt = (targetWeight && targetTimeframe)
		? `The user's goal is to reach ${targetWeight}kg in ${targetTimeframe} weeks. Your plan MUST create a calorie deficit/surplus appropriate for this goal, assuming a daily calorie need provided by your maintenance calculations.`
		: 'Generate a plan based on maintenance calories.';

	const prompt = `You are a professional nutritionist and meal planner. 
        The user has provided a list of core ingredients: ${userIngredients}.
        
        
        ${goalPrompt}
        Generate a comprehensive 7-day meal plan (Monday to Sunday) that includes a suggested Breakfast, Lunch, and Dinner for each day.
        
        **CRITICAL INSTRUCTION**: Every single meal listed in the plan MUST prominently feature one or more ingredients from the user's provided list (${userIngredients}). DO NOT introduce any major ingredients (like primary proteins or vegetables) that are NOT in the provided list, unless they are common pantry staples (salt, pepper, oil, water).
        
        **CRITICAL INSTRUCTION ADDED**: Provide an approximate calorie count (in kcal) for every meal, enclosed in parentheses at the end of the meal description (e.g., "Scrambled eggs with tomato and pork (350 kcal)"). The total daily calorie count must align with the weight goal specified above.
        
        Health constraints: ${healthConstraints || 'None'}. Ensure the entire plan strictly complies with these constraints. 
        
        Format the plan STRICTLY as a Markdown Table with FIVE columns: Day, Breakfast, Lunch, and Dinner. Do not include any text before or after the table.
        // 💡 FIX: ADD THE CALORIE COLUMN TO THE HEADER
        | Day | Breakfast | Lunch | Dinner | Total Daily Calories |
        | --- | --- | --- | --- | --- |
        | Monday | ... | ... | ... | (Approx. XXXX kcal) |
        (Continue for Tuesday through Sunday)
    `;

	try {
		const responseStream = await ai.models.generateContentStream({
			model: model,
			contents: [prompt],
		});

		const encoder = new TextEncoder();
		const readableStream = new ReadableStream({
			async start(controller) {
				for await (const chunk of responseStream) {
					controller.enqueue(encoder.encode(chunk.text));
				}
				controller.close();
			}
		});

		return new Response(readableStream, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});

	} catch (error) {
		console.error('Gemini Plan API Error:', error);
		return new Response('Failed to generate plan. Check server logs for details.', { status: 500 });
	}
}