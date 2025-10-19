import type { RequestHandler } from '@sveltejs/kit';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { recipient, subject, body } = await request.json();

		const { error } = await resend.emails.send({
			from: 'Namu Namu AI <onboarding@resend.dev>',
			to: recipient,
			subject: subject,
			html: `<h3>Your Shopping List:</h3>${body.replace(/\n/g, '<br>')}`,
		});

		if (error) {
			throw new Error(error.message);
		}

		return new Response('Email sent successfully', { status: 200 });

	} catch (error) {
		console.error('Error sending email:', error);
		return new Response(`Email send failed: ${error.message}`, { status: 500 });
	}
};