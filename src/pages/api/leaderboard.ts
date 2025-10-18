import type { APIRoute } from "astro";
import { getDb } from "../../lib/db";

export const prerender = false;

export const GET: APIRoute = async () => {
	try {
		const db = await getDb();

		// Get top 10 scores with user information
		const leaderboard = await db.collection('scores')
			.aggregate([
				{
					$lookup: {
						from: 'user',
						localField: 'userId',
						foreignField: 'id',
						as: 'userInfo'
					}
				},
				{
					$unwind: {
						path: '$userInfo',
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$sort: { wpm: -1 }
				},
				{
					$limit: 10
				},
				{
					$project: {
						wpm: 1,
						userId: 1,
						name: { $ifNull: ['$userInfo.name', '$userInfo.email', 'anonymous'] },
						createdAt: 1
					}
				}
			])
			.toArray();

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
