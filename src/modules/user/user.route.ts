import { createUserSchema, updateUserSchema } from "./user.schema";
import { createSuccessResponse } from "@core/helpers/response";
import {
	createUser,
	deleteUser,
	getAllUsers,
	getUserByEmail,
	getUserById,
	updateUser,
} from "./user.service";
import { authMiddleware } from "@modules/auth";
import { Hono } from "hono";
import { excludeFromList, excludeFromObject } from "@core/db";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";

export const users = new Hono();

users
	.use("*", (c, next) => authMiddleware(c, next, ["ADMIN"]))
	.get("/", async (c) => {
		const users = excludeFromList(await getAllUsers(), [
			"password",
			"updatedAt",
			"createdAt",
		]);

		if (!users.length) {
			throw new HTTPException(404, { message: "Пользователи не найдены" });
		}

		return c.json(
			createSuccessResponse({
				data: users,
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
				message: "Пользователь с таким Email уже существует",
			});
		}

		const user = await createUser({
			fullName,
			email,
			password,
			role,
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
				role,
			});

			return c.json(
				createSuccessResponse({
					data: excludeFromObject(updatedUser, [
						"password",
						"updatedAt",
						"createdAt",
					]),
					message: "Пользователь обновлен",
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
