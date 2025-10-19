import type { RequestHandler } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_API_KEY } from '$env/static/private';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { mealPlanMarkdown } = await request.json();

		if (!mealPlanMarkdown) {
			return new Response('Missing mealPlanMarkdown in request body', { status: 400 });
		}

		const prompt = `From the following weekly meal plan in markdown format, please extract a single, comprehensive shopping list with all ingredients and their total quantities consolidated. Return the list as a clean markdown bulleted list. Only return the list, nothing else.

    MEAL PLAN:
    ---
    ${mealPlanMarkdown}
    ---
    `;

		const responseStream = await ai.models.generateContentStream({
			model: 'gemini-2.5-flash',
			contents: [{ role: 'user', parts: [{ text: prompt }] }],
		});

		const stream = new ReadableStream({
			async start(controller) {
				for await (const chunk of responseStream) {
					controller.enqueue(chunk.text);
				}
				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
			},
		});

	} catch (error) {
		console.error('Error in shopping list generation API:', error);
		return new Response('Internal Server Error while generating the list', { status: 500 });
	}
};