import { Context, Next } from "hono";
import { verify, jwt } from "hono/jwt";
import { createErrorResponse, prisma } from "../helpers";
import { Role } from "@prisma/client";

export const authMiddleware = async (
	c: Context,
	next: Next,
	requiredRoles?: Role[]
) => {
	const token = c.req.header("Authorization")?.split(" ")[1];

	if (!token) {
		return c.json(
			createErrorResponse({
				message: "Токен не передан",
			}),
			401
		);
	}

	let decoded;

	try {
		decoded = await verify(token, Bun.env.ACCESS_SECRET!, "HS256");
	} catch (err) {
		return c.json(
			createErrorResponse({
				message: "Токен недействителен",
			}),
			401
		);
	}

	const user = await prisma.user.findUnique({
		where: {
			id: Number(decoded.id),
		},
	});

	if (!user) {
		return c.json(
			createErrorResponse({
				message: "Доступ запрещен",
			}),
			403
		);
	}

	if (requiredRoles && !requiredRoles.includes(user.role)) {
		return c.json(
			createErrorResponse({
				message: "Доступ запрещен",
			}),
			403
		);
	}

	c.set("user", {
		...user,
		password: undefined,
		createdAt: undefined,
		updatedAt: undefined,
	});

	return next();
};
