import "dotenv/config";
import mongoose from "mongoose";

export function connect(callback: () => void) {
	mongoose.set('strictQuery', true);
	mongoose.connect(String(process.env.DB_CONN_STRING), {
		dbName: "main"
	}).then(() => {
		console.log("Connected to database.");
		callback();
	}).catch((err) => console.error(err));
}