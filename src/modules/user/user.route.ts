import { createUserSchema, searchUserSchema, updateUserSchema } from "./user.schema";
import { createSuccessResponse } from "@core/helpers/response";
import {
	createUser,
	deleteUser,
	getAllUsers,
	getUserByEmail,
	getUserById,
	searchUsers,
	updateUser
} from "./user.service";
import { authMiddleware } from "@modules/auth";
import { Hono } from "hono";
import { excludeFromList, excludeFromObject } from "@core/db";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { User } from "@prisma/client";

export const users = new Hono();

users
	.use("*", (c, next) => authMiddleware(c, next, ["ADMIN"]))
	.get("/", zValidator("query", searchUserSchema), async (c) => {
		const { q, role } = c.req.valid("query");

		let users: User[] = [];

		if (q || role) {
			users = await searchUsers({ q, role: role === "ALL" ? undefined : role });
		} else {
			users = await getAllUsers();
		}

		if (!users.length) {
			throw new HTTPException(404, { message: "Пользователи не найдены" });
		}

		return c.json(
			createSuccessResponse({
				data: excludeFromList(users, ["password", "createdAt", "updatedAt"])
			})
		);
	})
	.get("/:id", async (c) => {
		const user = await getUserById(Number(c.req.param("id")));

		if (!user) {
			throw new HTTPException(404, { message: "Пользователь не найден" });
		}

		return c.json(createSuccessResponse({ data: user }));
	})
	.post("/", zValidator("json", createUserSchema), async (c) => {
		const { fullName, email, password, role } = c.req.valid("json");

		const existingUser = await getUserByEmail(email);

		if (existingUser) {
			throw new HTTPException(400, {
				message: "Пользователь с таким Email уже существует"
			});
		}

		const user = await createUser({
			fullName,
			email,
			password: await Bun.password.hash(password, "bcrypt"),
			role
		});

		return c.json(createSuccessResponse({ data: user }));
	})
	.on(
		["PATCH", "PUT"],
		"/:id",
		zValidator("json", updateUserSchema),
		async (c) => {
			const { fullName, email, role } = c.req.valid("json");

			const existingUser = await getUserById(Number(c.req.param("id")));

			if (!existingUser) {
				throw new HTTPException(404, { message: "Пользователь не найден" });
			}

			const updatedUser = await updateUser({
				fullName,
				email,
				role
			});

			return c.json(
				createSuccessResponse({
					data: excludeFromObject(updatedUser, [
						"password",
						"updatedAt",
						"createdAt"
					]),
					message: "Пользователь обновлен"
				})
			);
		}
	)
	.delete("/:id", async (c) => {
		const existingUser = await getUserById(Number(c.req.param("id")));

		if (!existingUser) {
			throw new HTTPException(404, { message: "Пользователь не существует" });
		}

		await deleteUser(Number(c.req.param("id")));

		return c.json(createSuccessResponse({ message: "Пользователь удален" }));
	});
