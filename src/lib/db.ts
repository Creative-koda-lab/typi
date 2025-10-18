import { MongoClient } from "mongodb";
import { Resource } from "sst";

const mongoUrl = Resource.MongoDbUri.value;
const client = new MongoClient(mongoUrl);

let isConnected = false;

export async function getDb() {
	if (!isConnected) {
		await client.connect();
		isConnected = true;
	}
	return client.db();
}
