import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { ReadableStream } from 'stream/web';
import { TextEncoder } from 'util';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

export async function POST({ request }) {
	const { gender, age, weight, height, activityLevel } = await request.json();

	let bmr;
	if (gender === 'male') {
		bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
	} else {
		bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
	}

	let multiplier;
	if (activityLevel === 'Sedentary') multiplier = 1.2;
	else if (activityLevel === 'Moderate') multiplier = 1.55;
	else multiplier = 1.9;

	const tdee = Math.round(bmr * multiplier);
	const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

	const prompt = `
        You are a highly qualified virtual health and nutrition coach. Analyze the following user profile and metrics:
        - **Gender:** ${gender}
        - **Age:** ${age}
        - **Weight:** ${weight} kg
        - **Height:** ${height} cm
        - **Activity:** ${activityLevel}
        - **Calculated TDEE (Maintenance Calories):** ${tdee} calories
        - **Calculated BMI:** ${bmi}

        Provide a brief analysis in Markdown format. Include the following sections:
        1. **Summary of Metrics:** State the user's BMI category (Underweight, Normal, Overweight, Obese).
        2. **Estimated Daily Calorie Needs:** State the maintenance (${tdee} kcal) and provide recommended calorie ranges for both weight loss and weight gain.
        3. **Personalized Dietary Focus:** Give 3 actionable, non-medical, diet-related tips tailored to their profile and activity level.
        4. **Disclaimer:** End with a strong reminder that this is an AI recommendation, not professional medical advice.
    `;

	try {
		const responseStream = await ai.models.generateContentStream({ model: model, contents: [prompt] });

		const encoder = new TextEncoder();
		const readableStream = new ReadableStream({
			async start(controller) {
				for await (const chunk of responseStream) {
					controller.enqueue(encoder.encode(chunk.text));
				}
				controller.close();
			}
		});

		// @ts-ignore
		return new Response(readableStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

	} catch (error) {
		console.error('Gemini Health Analysis Error:', error);
		return new Response('Failed to generate health analysis.', { status: 500 });
	}
}