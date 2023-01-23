import "dotenv/config";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import sessionFileStore from "session-file-store";
import { connect } from "./src/db/database";
import indexRouter from "./src/routers/indexRouter";
import blogRouter from "./src/routers/blogRouter";
import userRouter from "./src/routers/userRouter";
import commentRouter from "./src/routers/commentRouter";

declare module "express-session" {
	interface SessionData {
		user: {
			id: mongoose.Types.ObjectId,
			username: string
		};
	}
}

const app = express();
const FileStore = sessionFileStore(session);
const sessionMiddleware = session({
	secret: String(process.env.SESSION_SECRET),
	resave: false,
	saveUninitialized: true,
	name: "connect.sid",
	store: new FileStore()
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(sessionMiddleware);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/blog", blogRouter);
app.use("/user", userRouter);
app.use("/comment", commentRouter);

connect(() => app.listen(Number(process.env.PORT), () => console.log("Listening on port " + process.env.PORT)));