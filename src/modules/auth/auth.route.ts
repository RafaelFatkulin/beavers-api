import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
	refreshSchema,
	signinSchema,
	signoutSchema,
	signupSchema,
} from "./auth.schema";
import { createUser, getUserByEmail, getUserById } from "@modules/user";
import { HTTPException } from "hono/http-exception";
import {
	generateTokens,
} from "./auth.handler";
import {
	createRefreshToken,
	getRefreshToken,
	revokeRefreshToken,
} from "./auth.service";
import { createSuccessResponse } from "@core/helpers";
import { authMiddleware } from "./auth.middleware";

export const auth = new Hono<{ Variables: { user: unknown } }>();

auth
	.post("/signup", zValidator("json", signupSchema), async (c) => {
		const { fullName, email, role } = c.req.valid("json");

		const existingUser = await getUserByEmail(email);

		if (existingUser) {
			throw new HTTPException(400, {
				message: "Пользователь с таким Email уже существует",
			});
		}

		const user = await createUser({
			fullName,
			email,
			role,
		});

		if (!user) {
			throw new HTTPException(400, {
				message: "Произошла ошибка при создании пользователя",
			});
		}

		const { accessToken, refreshToken, refreshExpiresAt } =
			await generateTokens(user.id, user.role);

		await createRefreshToken({
			token: refreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		});

		// setCookie(c, "refreshToken", refreshToken, refreshTokenCookieOptions);

		return c.json(
			createSuccessResponse({
				message: "Регистрация прошла успешно",
				data: { accessToken, refreshToken, user },
			})
		);
	})
	.post("/signin", zValidator("json", signinSchema), async (c) => {
		const { email, password } = c.req.valid("json");
		console.log({ email, password });

		const user = await getUserByEmail(email);

		if (!user) {
			throw new HTTPException(400, {
				message: "Пользователь не найден",
			});
		}

		const validPassword = await Bun.password.verify(
			password,
			user.password,
			"bcrypt"
		);

		if (!validPassword) {
			throw new HTTPException(400, {
				message: "Введены некорректные данные",
			});
		}

		const { accessToken, refreshToken, refreshExpiresAt } =
			await generateTokens(user.id, user.role);

		await createRefreshToken({
			token: refreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		});

		return c.json(
			createSuccessResponse({
				data: { accessToken, refreshToken, user },
			})
		);
	})
	.post("/signout", zValidator("json", signoutSchema), async (c) => {
		const { refreshToken } = c.req.valid("json");

		if (!refreshToken) {
			throw new HTTPException(401, {
				message: "Вам нужен действительный токен обновления",
			});
		}

		const existingRefreshToken = await getRefreshToken(refreshToken);

		if (!existingRefreshToken || existingRefreshToken.revoked) {
			throw new HTTPException(401, {
				message: "Токен обновления не существует",
			});
		}

		await revokeRefreshToken(existingRefreshToken.id);

		return c.json(
			createSuccessResponse({
				message: "Вы вышли из аккаунта",
			})
		);
	})
	.post("/refresh", zValidator("json", refreshSchema), async (c) => {
		const { refreshToken } = c.req.valid("json");

		if (!refreshToken) {
			throw new HTTPException(401, {
				message: "Вам нужен действительный токен обновления",
			});
		}

		const existingRefreshToken = await getRefreshToken(refreshToken, false);

		if (!existingRefreshToken) {
			throw new HTTPException(401, {
				message: "Вам нужен действительный токен обновления",
			});
		}

		const user = await getUserById(existingRefreshToken.userId);

		if (!user) {
			throw new HTTPException(401, {
				message: "Вам нужен действительный токен обновления",
			});
		}

		const {
			accessToken,
			refreshToken: newRefreshToken,
			refreshExpiresAt,
		} = await generateTokens(user.id, user.role);

		await revokeRefreshToken(existingRefreshToken.id);

		const newToken = await createRefreshToken({
			token: newRefreshToken,
			userId: user.id,
			expiresAt: refreshExpiresAt,
		});

		return c.json(
			createSuccessResponse({
				data: { accessToken, refreshToken: newToken.token },
			})
		);
	})
	.get(
		"/me",
		(c, next) => authMiddleware(c, next),
		async (c) => {
			const user = c.get("user");

			if (!user) {
				throw new HTTPException(404, {
					message: "Пользователь не найден",
				});
			}

			return c.json(createSuccessResponse({ data: { ...user } }));
		}
	);
