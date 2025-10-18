import { MongoClient } from "mongodb";

const mongoUrl = import.meta.env.MONGODB_URI || "mongodb://localhost:27017/typivibe";
const client = new MongoClient(mongoUrl);

let isConnected = false;

export async function getDb() {
	if (!isConnected) {
		await client.connect();
		isConnected = true;
	}
	return client.db();
}
