import { Router } from "express";
import { BlogModel } from "../schemas/blog";
import { User, UserModel } from "../schemas/user";

const router = Router();
const BLOGS_PER_PAGE = 15;

router.get("/", async (req, res, next) => {
	const { p = 1, q = "" } = req.query;

	try {
		const blogs = await BlogModel.find(q ? { title: q } : {}).sort({ created_at: -1 }).skip((Number(p) - 1) * BLOGS_PER_PAGE).limit(BLOGS_PER_PAGE).populate<{ writer: User }>("writer");
		res.render("index", { blogs });
	} catch (e) {
		next(e);
	}
});

router.route("/login")
	.get((_req, res) => res.render("login"))
	.post(async (req, res, next) => {
		const { username, password, returnurl = "/" } = req.body;

		try {
			const user = await UserModel.findOne({ username });

			if (!user) {
				throw "존재하지 않는 사용자입니다.";
			} else if (user.password !== password) {
				throw "비밀번호가 일치하지 않습니다.";
			}

			req.session.user = {
				id: user._id,
				username: user.username
			};
			req.session.save();

			res.redirect(returnurl);
		} catch (e) {
			next(e);
		}
	});

router.route("/signup")
	.get((_req, res) => res.render("signup"))
	.post(async (req, res, next) => {
		const { username, password, confirmPassword } = req.body;

		try {
			if (await UserModel.exists({ username })) {
				throw "이미 사용된 사용자명입니다.";
			} else if (password !== confirmPassword) {
				throw "비밀번호가 일치하지 않습니다.";
			}

			await UserModel.create({
				username,
				password
			});

			res.redirect("/login");
		} catch (e) {
			next(e);
		}
	});

router.get("/logout", (req, res) => {
	if (req.session.user) {
		req.session.destroy(() => {});
		res.clearCookie("connect.sid");
	}

	res.redirect("/");
});

router.get("/checkusername/:username", async (req, res, next) => {
	const { username } = req.params;

	try {
		res.send(!await UserModel.exists({ username }));
	} catch (_e) {
		res.sendStatus(500);
	}
});

export default router;