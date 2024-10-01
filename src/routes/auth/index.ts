import { zValidator } from "@hono/zod-validator";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { Hono } from "hono";
import { signinSchema, signupSchema } from "./auth.schema";
import {
	createErrorResponse,
	createSuccessResponse,
	prisma,
} from "../../helpers";
import { generateTokens, refreshTokenCookieOptions } from "./auth.handler";
import { verify } from "hono/jwt";

export const auth = new Hono().basePath("/auth");

auth.post("/sighup", zValidator("json", signupSchema), async (c) => {
	const { fullName, email, password, role } = c.req.valid("json");

	const existingUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (existingUser) {
		return c.json(
			createErrorResponse({
				message: "Пользователь с таким Email уже существует",
			}),
			400
		);
	}

	const user = await prisma.user.create({
		data: {
			fullName,
			email,
			role,
			password: await Bun.password.hash(password),
		},
	});

	if (!user) {
		return c.json(
			createErrorResponse({
				message: "Произошла ошибка при создании пользователя",
			})
		);
	}

	const { accessToken, refreshToken, refreshExpiresAt } = await generateTokens(
		user.id,
		user.role
	);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		},
	});

	setCookie(c, "refreshToken", refreshToken, refreshTokenCookieOptions);

	return c.json(
		createSuccessResponse({
			message: "Регистрация прошла успешно",
			data: {
				accessToken,
				refreshToken,
			},
		}),
		201
	);
});

auth.post("/signin", zValidator("json", signinSchema), async (c) => {
	const { email, password } = c.req.valid("json");

	const user = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (!user) {
		return c.json(
			createErrorResponse({
				message: "Введены некорректные данные",
			}),
			400
		);
	}

	const validPassword = await Bun.password.verify(
		password,
		user.password,
		"bcrypt"
	);

	if (!validPassword) {
		return c.json(
			createErrorResponse({
				message: "Введены некорректные данные",
			}),
			400
		);
	}

	const { accessToken, refreshToken, refreshExpiresAt } = await generateTokens(
		user.id,
		user.role
	);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		},
	});

	setCookie(c, "refreshToken", refreshToken, refreshTokenCookieOptions);

	return c.json(
		createSuccessResponse({
			data: {
				accessToken,
				refreshToken,
			},
		}),
		200
	);
});

auth.post("/signout", async (c) => {
	const refreshTokenCookie = getCookie(c, "refreshToken");

	if (!refreshTokenCookie) {
		return c.json(
			createErrorResponse({
				message: "",
			}),
			204
		);
	}

	const refreshToken = verify(refreshTokenCookie, Bun.env.REFRESH_SECRET!);

	return c.json(
		createSuccessResponse({
			data: null,
		}),
		200
	);
});
