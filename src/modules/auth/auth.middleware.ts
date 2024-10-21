import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Role } from "@prisma/client";
import { HTTPException } from "hono/http-exception";
import { getUserById } from "../user";

export const authMiddleware = async (
	c: Context,
	next: Next,
	requiredRoles?: Role[]
) => {
	const token = c.req.header("Authorization")?.split(" ")[1];

	if (!token) {
		throw new HTTPException(401, {
			message: "Токен не передан",
		});
	}

	let decoded;

	try {
		decoded = await verify(token, Bun.env.ACCESS_SECRET!, "HS256");
	} catch (err) {
		throw new HTTPException(401, {
			message: "Токен недействителен",
		});
	}

	const user = await getUserById(Number(decoded.id));

	if (!user) {
		throw new HTTPException(403, {
			message: "Доступ запрещен",
		});
	}

	if (requiredRoles && !requiredRoles.includes(user.role)) {
		throw new HTTPException(403, {
			message: "Доступ запрещен",
		});
	}

	c.set("user", {
		...user,
		password: undefined,
		createdAt: undefined,
		updatedAt: undefined,
	});

	return next();
};
