import type { APIRoute } from "astro";
import { auth } from "../../lib/auth";
import { getDb } from "../../lib/db";

export const prerender = false;

// GET: Retrieve user's best score
export const GET: APIRoute = async ({ request }) => {
	try {
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return new Response(JSON.stringify({ bestScore: 0 }), {
				status: 200,
				headers: { "Content-Type": "application/json" }
			});
		}

		const database = await getDb();
		const scores = database.collection("scores");

		const userScore = await scores.findOne({ userId: session.user.id });

		return new Response(JSON.stringify({
			bestScore: userScore?.bestWpm || 0
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		console.error("Error getting score:", error);
		return new Response(JSON.stringify({ error: "Failed to get score" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};

// POST: Save user's best score
export const POST: APIRoute = async ({ request }) => {
	try {
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" }
			});
		}

		const body = await request.json();
		const { wpm } = body;

		if (typeof wpm !== "number" || wpm < 0) {
			return new Response(JSON.stringify({ error: "Invalid WPM value" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const database = await getDb();
		const scores = database.collection("scores");

		// Check if this is a new best score
		const existingScore = await scores.findOne({ userId: session.user.id });
		const currentBest = existingScore?.bestWpm || 0;

		console.log('Saving score:', { userId: session.user.id, wpm, currentBest, existingScore });

		if (wpm > currentBest) {
			// Update or insert the score, only if it's higher
			const result = await scores.updateOne(
				{ userId: session.user.id },
				{
					$set: {
						userId: session.user.id,
						wpm: wpm,
						bestWpm: wpm,
						updatedAt: new Date()
					},
					$setOnInsert: {
						createdAt: new Date()
					}
				},
				{
					upsert: true
				}
			);
			console.log('Score saved:', result);
		}

		return new Response(JSON.stringify({
			success: true,
			bestScore: Math.max(currentBest, wpm),
			isNewBest: wpm > currentBest
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (error) {
		console.error("Error saving score:", error);
		return new Response(JSON.stringify({ error: "Failed to save score" }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
