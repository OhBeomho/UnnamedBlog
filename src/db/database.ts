import "dotenv/config";
import mongoose from "mongoose";

export function connect(callback: () => void) {
	const isProduction = process.env.NODE_ENV === "production";

	if (!isProduction) {
		mongoose.set("debug", true);
	}

	mongoose.set('strictQuery', true);
	mongoose.connect(String(process.env.DB_CONN_STRING), {
		dbName: isProduction ? "main" : "test"
	}).then(() => {
		console.log("Connected to database.");
		callback();
	}).catch((err) => console.error(err));
}