import { z } from "zod";

export const signinSchema = z.object({
	email: z
		.string({ required_error: "Email обязателен к заполнению" })
		.email({ message: "Некорректный Email" }),
	password: z
		.string({ required_error: "Пароль обязателен к заполнению" })
		.min(8, { message: "Пароль должен содержать не менее 8 символов" }),
});

export const signupSchema = z.object({
	fullName: z
		.string({ required_error: "ФИО обязательно для заполнения" })
		.min(10, {
			message: "ФИО должно содержать не менее 10 символов",
		}),
	email: z
		.string({ required_error: "Email обязателен к заполнению" })
		.email({ message: "Некорректный Email" }),
	password: z
		.string({ required_error: "Пароль обязателен к заполнению" })
		.min(8, { message: "Пароль должен содержать не менее 8 символов" }),
	role: z.enum(["ADMIN", "LOGISTICIAN", "MANAGER"]).optional(),
});

export const signoutSchema = z.object({
	refreshToken: z.string().optional(),
});

export const refreshSchema = signoutSchema;
