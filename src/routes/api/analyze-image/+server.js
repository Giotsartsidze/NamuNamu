import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';
import { ReadableStream } from 'stream/web';
import { TextEncoder } from 'util';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const model = "gemini-2.5-flash"; // Supports multimodal inputs

/**
 * Converts a base64 string to a GoogleGenAI Part object.
 * @param {string} mimeType - The MIME type of the image.
 * @param {string} base64Data - The base64 encoded image data.
 */
function fileToGenerativePart(mimeType, base64Data) {
	return {
		inlineData: {
			data: base64Data,
			mimeType
		}
	};
}

/**
 * Handles POST requests for image analysis.
 * Expects { imageBase64: string, imageMimeType: string }
 */
export async function POST({ request }) {
	try {
		const { imageBase64, imageMimeType } = await request.json();

		if (!imageBase64 || !imageMimeType) {
			return new Response('Missing image data.', { status: 400 });
		}

		const imagePart = fileToGenerativePart(imageMimeType, imageBase64);

		const promptText = `Analyze this image of food. Identify the main components (e.g., chicken, rice, broccoli) and estimate the total calorie count and serving size. 
            Provide the output STRICTLY in Markdown with the following sections: 
            ### Calorie Estimate, ### Main Ingredients, and ### Nutritional Note. 
            Be conservative with your calorie estimate.
        `;

		const responseStream = await ai.models.generateContentStream({
			model: model,
			contents: [
				{ role: 'user', parts: [imagePart, { text: promptText }] }
			],
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

		// @ts-ignore
		return new Response(readableStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

	} catch (error) {
		console.error('Gemini Image Analysis Error:', error);
		return new Response('Failed to analyze image.', { status: 500 });
	}
}
