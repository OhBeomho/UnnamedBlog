import { Router } from "express";
import { BlogModel } from "../schemas/blog";
import { CommentModel } from "../schemas/comment";
import { User, UserModel } from "../schemas/user";
import fs from "fs";
import multer from "multer";

const router = Router();
const upload = multer({
	dest: "uploads/",
	fileFilter: (req, file, callback) => {
		if (file.mimetype.split("/")[0] === "image") {
			callback(null, true);
		} else {
			callback(null, false);
		}
	}
});
const BLOGS_PER_PAGE = 15;

router.post("/", upload.single("image"), async (req, res, next) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}

	const { title, content, blogid } = req.body;
	const { id } = req.session.user;
	const file = req.file;

	try {
		let blog;

		if (!blogid) {
			blog = await BlogModel.create({
				title,
				content,
				writer: id,
				file: file ? file.path : undefined,
				fileType: file ? file.mimetype : undefined
			});
		} else {
			blog = await BlogModel.findById(blogid).orFail(new Error(`ID가 ${blogid}인 글이 없습니다.`));

			if (blog.file && file) {
				fs.unlinkSync(blog.file);
			}

			blog = await BlogModel.findByIdAndUpdate(blogid, { $set: {
				title,
				content,
				file: file ? file.path : undefined,
				fileType: file ? file.mimetype : undefined
			} }).orFail(new Error(`ID가 ${blogid}인 글이 없습니다.`));
		}

		res.redirect(`/blog/b/${blog._id}`);
	} catch (e) {
		next(e);
	}
});

router.route("/b/:blogid")
	.get(async (req, res, next) => {
		const { blogid } = req.params;

		try {
			const blog = await BlogModel.findById(blogid).populate<{ writer: User }>("writer")
				.orFail(new Error(`ID가 ${blogid}인 글이 없습니다.`));
			const comments = await Promise.all(blog.comments.map((comment) => CommentModel.findById(comment).populate<{ writer: User }>("writer").exec()));

			res.render("read", {
				me: req.session.user?.username,
				blog,
				comments,
				file: blog.file ? fs.readFileSync(blog.file) : undefined,
				fileType: blog.fileType
			});
		} catch (e) {
			next(e);
		}
	}).delete(async (req, res, next) => {
		if (!req.session.user) {
			res.redirect("/login");
			return;
		}

		const { blogid } = req.params;
		const { username } = req.session.user;

		try {
			const blog = await BlogModel.findById(blogid).populate<{ writer: User }>("writer")
				.orFail(new Error(`ID가 ${blogid}인 글이 없습니다.`));

			if (blog.writer.username !== username) {
				throw "글의 작성자가 아닙니다.";
			}

			if (blog.file) {
				fs.unlinkSync(blog.file);
			}

			await BlogModel.findByIdAndDelete(blogid);
			await Promise.all(blog.comments.map((comment) => CommentModel.findByIdAndDelete(comment)));

			res.sendStatus(200);
		} catch (e) {
			res.status(500).send(e);
		}
	});

router.get("/u/:username", async (req, res, next) => {
	const { username } = req.params;
	const { p = 1 } = req.query;

	try {
		const userID = (await UserModel.findOne({ username }).orFail(new Error(`사용자명이 ${username}인 사용자가 없습니다.`)))._id;
		const blogs = await BlogModel.find({ writer: userID }).sort({ writeDate: -1 }).skip((Number(p) - 1) * BLOGS_PER_PAGE).limit(BLOGS_PER_PAGE).populate<{ writer: User }>("writer");
		res.render("blog", { username, blogs });
	} catch (e) {
		next(e);
	}
});

router.get("/write", (req, res) => {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}

	res.render("write");
});

router.get("/update/:blogid", async (req, res, next) => {
	if (!req.session.user) {
		return;
	}

	const { blogid } = req.params;

	try {
		const blog = await BlogModel.findById(blogid).populate<{ writer: User }>("writer").orFail(new Error(`ID가 ${blogid}인 글이 없습니다.`));

		if (req.session.user.username !== blog.writer.username) {
			throw "글의 작성자가 아닙니다.";
		}

		res.render("update", { blog });
	} catch (e) {
		next(e);
	}
});

export default router;