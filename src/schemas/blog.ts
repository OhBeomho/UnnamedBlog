import { model, Schema } from "mongoose";

const blogSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	writeDate: {
		type: Date,
		default: Date.now()
	},
	writer: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true
	},
	content: {
		type: String,
		required: true
	},
	comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

export interface Blog {
	title: string,
	writeDate: Date,
	writer: Schema.Types.ObjectId,
	content: string,
	comments: Schema.Types.ObjectId[]
}

export const BlogModel = model("Blog", blogSchema);