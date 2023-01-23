import { model, Schema } from "mongoose";

const commentSchema = new Schema({
	writer: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	writeDate: {
		type: Date,
		default: Date.now()
	},
	content: {
		type: String,
		required: true
	}
});

export interface Comment {
	writer: Schema.Types.ObjectId,
	writeDate: Date,
	content: string
}

export const CommentModel = model("Comment", commentSchema);