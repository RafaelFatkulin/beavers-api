import { verify } from "hono/jwt";
import { zValidator } from "@hono/zod-validator";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { Hono } from "hono";
import {
	refreshSchema,
	signinSchema,
	signoutSchema,
	signupSchema,
} from "./auth.schema";
import {
	createErrorResponse,
	createSuccessResponse,
	prisma,
} from "../../helpers";
import { generateTokens, refreshTokenCookieOptions } from "./auth.handler";
import { authMiddleware } from "../../middleware/bearerAuth";

export const auth = new Hono<{ Variables: { user: unknown } }>().basePath(
	"/auth"
);

auth.post("/signup", zValidator("json", signupSchema), async (c) => {
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
			password: await Bun.password.hash(password, "bcrypt"),
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

	console.log(email, password);

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

auth.post("/signout", zValidator("json", signoutSchema), async (c) => {
	const { refreshToken } = c.req.valid("json");

	if (!refreshToken) {
		return c.json(
			createErrorResponse({
				message: "",
			}),
			400
		);
	}

	const existingRefreshToken = await prisma.refreshToken.findFirst({
		where: {
			token: refreshToken,
		},
	});

	if (!existingRefreshToken || existingRefreshToken.revoked) {
		return c.json(
			createErrorResponse({
				message: "",
			}),
			400
		);
	}

	const success = await prisma.refreshToken.update({
		where: {
			id: existingRefreshToken.id,
		},
		data: {
			revoked: true,
		},
	});

	if (!success) {
		return c.json(
			createErrorResponse({
				message: "Произошла неизвестная ошибка",
			}),
			400
		);
	}

	return c.json(
		createSuccessResponse({
			data: null,
			message: "Вы вышли из аккаунта",
		}),
		200
	);
});

auth.post("/refresh", zValidator("json", refreshSchema), async (c) => {
	const { refreshToken } = c.req.valid("json");

	console.log("@came", refreshToken);

	if (!refreshToken) {
		console.log("token not provided");
		return c.json(
			createErrorResponse({
				message: "You need a valid refresh token",
			}),
			400
		);
	}

	const existingRefreshToken = await prisma.refreshToken.findFirst({
		where: {
			token: refreshToken,
			revoked: false,
		},
	});

	console.log("@@existing", existingRefreshToken);

	if (!existingRefreshToken) {
		return c.json(
			createErrorResponse({
				message: "You need a valid refresh token",
			}),
			400
		);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: existingRefreshToken.userId,
		},
	});

	console.log("@@user-by-token", user);

	if (!user) {
		console.log("user not-found");

		return c.json(
			createErrorResponse({
				message: "You need a valid refresh token",
			}),
			400
		);
	}

	const {
		accessToken,
		refreshToken: newRefreshToken,
		refreshExpiresAt,
	} = await generateTokens(user.id, user.role);

	await prisma.refreshToken.update({
		where: {
			id: existingRefreshToken.id,
		},
		data: {
			revoked: true,
		},
	});

	const newToken = await prisma.refreshToken.create({
		data: {
			userId: user.id,
			token: newRefreshToken,
			expiresAt: refreshExpiresAt,
		},
	});

	console.log("@new", newToken.token);

	return c.json(
		createSuccessResponse({
			data: {
				accessToken,
				refreshToken: newToken.token,
			},
		}),
		200
	);
});

auth.get(
	"/me",
	(c, next) => authMiddleware(c, next),
	async (c) => {
		const user = c.get("user");

		if (!user) {
			return c.json(
				createErrorResponse({
					message: "Пользователь не найден",
				}),
				404
			);
		}

		return c.json(
			createSuccessResponse({
				data: {
					...user,
				},
			}),
			200
		);
	}
);
