import { Router } from "express";
import { BlogModel } from "../schemas/blog";
import { CommentModel } from "../schemas/comment";

const router = Router();

router.post("/", async (req, res, next) => {
	const { content, blogid } = req.body;

	if (!req.session.user) {
		res.redirect("/login?r=" + encodeURIComponent("/blog/b/" + blogid));
		return;
	}

	try {
		if (!content) {
			throw "댓글 내용을 입력해 주세요.";
		}

		const comment = await CommentModel.create({
			content,
			writer: req.session.user.id
		});
		await BlogModel.findByIdAndUpdate(blogid, { $push: { comments: comment._id } });

		res.redirect("back");
	} catch (e) {
		next(e);
	}
});

export default router;