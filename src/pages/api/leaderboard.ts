import type { APIRoute } from "astro";
import { getDb } from "../../lib/db";
import { ObjectId } from "mongodb";

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const db = await getDb();

		// Get all scores sorted by WPM (highest first)
		const scores = await db.collection('scores')
			.find({ wpm: { $gt: 0 } })
			.sort({ wpm: -1, updatedAt: 1 })
			.limit(10)
			.toArray();

		// Normalize user IDs to strings for lookup and serialization
		const normalizedScores = scores.map((score: any) => {
			const rawUserId = score.userId;
			const userId = typeof rawUserId === 'string' ? rawUserId : rawUserId?.toString();
			return {
				...score,
				userId
			};
		});

		const userIds = normalizedScores
			.map((score) => score.userId)
			.filter((userId): userId is string => Boolean(userId));
		const uniqueUserIds = [...new Set(userIds)];

		let userMap = new Map<string, any>();
		if (uniqueUserIds.length > 0) {
			const objectIds = uniqueUserIds
				.filter((id) => ObjectId.isValid(id))
				.map((id) => new ObjectId(id));

			if (objectIds.length > 0) {
				const users = await db.collection('user')
					.find({ _id: { $in: objectIds } })
					.project({ name: 1, email: 1 })
					.toArray();

				userMap = new Map(users.map((u: any) => [u._id.toString(), u]));
			}
		}

		// Combine scores with user info
		const leaderboard = normalizedScores.map((score: any) => {
			const user = score.userId ? userMap.get(score.userId) : undefined;
			return {
				wpm: score.bestWpm ?? score.wpm,
				userId: score.userId,
				name: user?.name || user?.email || 'anonymous',
				createdAt: score.createdAt
			};
		});

		return new Response(JSON.stringify({ leaderboard }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (error) {
		console.error('Leaderboard error:', error);
		return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};
