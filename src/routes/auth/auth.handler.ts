import { Role } from "@prisma/client";
import { sign } from "hono/jwt";

export const generateTokens = async (id: number, role: Role) => {
	const accessToken = await sign(
		{
			id,
			role,
			exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
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

	const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	return {
		accessToken,
		refreshToken,
		refreshExpiresAt,
	};
};

export const refreshTokenCookieOptions = {
	httpOnly: true,
	maxAge: 60 * 60 * 24 * 7, // 7 days
};
