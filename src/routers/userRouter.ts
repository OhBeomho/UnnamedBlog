import { Router } from "express";
import { BlogModel } from "../schemas/blog";
import { CommentModel } from "../schemas/comment";
import { UserModel } from "../schemas/user";

const router = Router();

async function findUser(username: string) {	
	const user = await UserModel.findOne({ username });
	
	if (!user) {
		throw `${username}는 존재하지 않는 사용자입니다.`;
	}

	const blogCount = await BlogModel.count({ writer: user._id });
	const commentCount = await CommentModel.count({ writer: user._id });

	return { user, blogCount, commentCount };
}

router.get("/", async (req, res, next) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}

	try {
		res.render("user", await findUser(req.session.user.username));
	} catch (e) {
		next(e);
	}
});

router.get("/:username", async (req, res, next) => {
	const { username } = req.params;

	try {
		res.render("user", await findUser(username));
	} catch (e) {
		next(e);
	}
});

export default router;