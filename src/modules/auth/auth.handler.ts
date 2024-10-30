import { Role } from "@prisma/client";
import { sign } from "hono/jwt";
import { CookieOptions } from "hono/utils/cookie";

export const generateTokens = async (id: number, role: Role) => {
	const accessToken = await sign(
		{
			id,
			role,
			exp: Math.floor(Date.now() / 1000) + 15, // 5 minutes
		},
		Bun.env.ACCESS_SECRET!
	);

	const refreshToken = await sign(
		{
			id,
			role,
			exp: Math.floor(Date.now() / 1000) * 7 * 24 * 60 * 60, // 7 days
		},
		Bun.env.REFRESH_SECRET!
	);

	const accessExpiresAt = new Date(Date.now() + 15 * 1000);
	const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	return {
		accessToken,
		refreshToken,
		accessExpiresAt,
		refreshExpiresAt,
	};
};

export const accessTokenCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: true,
	maxAge: 60 * 5,
	sameSite: "None",
};

export const refreshTokenCookieOptions: CookieOptions = {
	httpOnly: true,
	secure: true,
	maxAge: 60 * 60 * 24 * 7,
	sameSite: "None",
};
