import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { anonymous } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { Resource } from "sst";

// MongoDB connection using SST Resource
const mongoUrl = Resource.MongoDbUri.value;

// Create client with aggressive timeouts to detect connection issues quickly
const client = new MongoClient(mongoUrl, {
	serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
	connectTimeoutMS: 5000,
	socketTimeoutMS: 5000,
	maxPoolSize: 1, // Reduce connection pool for serverless
	minPoolSize: 0,
	retryWrites: true,
	retryReads: true,
});

let isConnected = false;
let database: any;

async function connectToDatabase() {
	if (!isConnected) {
		try {
			console.log("Attempting to connect to MongoDB...");
			await client.connect();
			database = client.db();
			isConnected = true;
			console.log("MongoDB connected successfully");
		} catch (error) {
			console.error("MongoDB connection failed:", error);
			throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}
	return database;
}

// Initialize connection immediately
const dbPromise = connectToDatabase();

export const auth = betterAuth({
	database: mongodbAdapter(await dbPromise, { client }),

	// Enable email and password authentication
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false, // Set to true in production with email service
	},

	// Enable social authentication
	socialProviders: {
		google: {
			clientId: Resource.GoogleClientId?.value || "",
			clientSecret: Resource.GoogleClientSecret?.value || "",
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
	trustedOrigins: ["http://localhost:4321", "http://localhost:4324", "https://typi.creative-koda.com"],
	secret: Resource.AuthSecret.value,
});
