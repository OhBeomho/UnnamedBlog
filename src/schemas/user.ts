import { model, Schema } from "mongoose";

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	joinDate: {
		type: Date,
		default: Date.now()
	}
});

export interface User {
	username: string,
	password: string,
	joinDate: Date
}

export const UserModel = model("User", userSchema);