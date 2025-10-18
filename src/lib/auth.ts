import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { anonymous } from "better-auth/plugins";
import { MongoClient } from "mongodb";

// MongoDB connection
const mongoUrl = import.meta.env.MONGODB_URI || "mongodb://localhost:27017/typivibe";
const client = new MongoClient(mongoUrl);

// Connect to MongoDB
await client.connect();
const database = client.db();

export const auth = betterAuth({
	database: mongodbAdapter(database, { client }),

	// Enable email and password authentication
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Set to true in production with email service
	},

	// Enable social authentication
	socialProviders: {
		google: {
			clientId: import.meta.env.GOOGLE_CLIENT_ID || "",
			clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || "",
		},
	},

	// Enable anonymous authentication
	plugins: [
		anonymous({
			// When anonymous user signs up, link their data
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				// The score will be preserved since it's linked to user session
				console.log('Linking anonymous user to new account:', { anonymousUser, newUser });
			}
		})
	],

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 365, // 1 year
		updateAge: 60 * 60 * 24 * 30, // Update every 30 days
	},

	// Basic configuration
	baseURL: import.meta.env.PUBLIC_APP_URL || "http://localhost:4321",
	trustedOrigins: ["http://localhost:4321", "http://localhost:4324"],
	secret: import.meta.env.AUTH_SECRET || "your-secret-key-change-this-in-production",
});
