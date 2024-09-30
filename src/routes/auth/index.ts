import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { signinSchema } from "./auth.schema";
import {
	createErrorResponse,
	createSuccessResponse,
	prisma,
} from "../../helpers";
import { sign } from "hono/jwt";

export const auth = new Hono().basePath("/auth");

auth.post(
	"/signin",
	zValidator("json", signinSchema, (result, c) => {
		if (!result.success) {
			const errors = result.error.issues.reduce((acc, issue) => {
				acc[issue.path[0]] = issue.message;
				return acc;
			}, {} as Record<string, string>);

			return c.json(
				createErrorResponse({
					message: errors,
				}),
				400
			);
		}
	}),
	async (c) => {
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

		const token = await sign(
			{
				id: user.id,
				email: user.email,
				role: user.role,
				exp: Math.floor(Date.now() / 1000) + 60 * 5,
			},
			Bun.env.ACCESS_SECRET as string
		);

		console.log('token', token);
		

		return c.json(createSuccessResponse({ data: { token } }));
	}
);
