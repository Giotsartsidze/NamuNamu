import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { Readable } from 'stream';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

export async function POST({ request }) {
	const { ingredients, dietaryRestrictions, medicalConditions } = await request.json();

	const healthConstraints = [dietaryRestrictions, medicalConditions]
		.filter(c => c && c.trim() !== '')
		.join('; ');

	if (!ingredients || ingredients.length === 0) {
		return new Response('Please provide ingredients.', { status: 400 });
	}

	const prompt = `You are a professional chef who is also highly knowledgeable in nutritional science. 
    The user has the following ingredients: ${ingredients.join(', ')}. 

    Health constraints: ${healthConstraints || 'None'}. **CRITICAL INSTRUCTION**: Ensure the generated recipe strictly complies with these constraints (e.g., if Diabetic, no high sugar ingredients). If a condition is highly sensitive, add a small, one-sentence disclaimer at the end of the recipe recommending professional consultation.

        Generate ONE unique recipe that uses as many of the provided ingredients as possible. 
        Format your response strictly using Markdown with these headings: 'Recipe Title', 'Ingredients', 'Instructions', and 'Estimated Time'. 
        Be concise and highly practical.
    `;

	try {
		const responseStream = await ai.models.generateContentStream({
			model: model,
			contents: [prompt],
		});

		const readableStream = Readable.from(
			(async function* () {
				for await (const chunk of responseStream) {
					yield chunk.text;
				}
			})()
		);

		// @ts-ignore
		return new Response(readableStream, {
			headers: {
				'Content-Type': 'text/plain',
			},
		});

	} catch (error) {
		console.error('Gemini API Error:', error);
		return new Response('Failed to generate recipe. Check server logs for details.', { status: 500 });
	}
}