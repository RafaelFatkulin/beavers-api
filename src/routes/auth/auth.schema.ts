import { z } from "zod";

export const signinSchema = z.object({
	email: z
		.string({ required_error: "Email обязателен к заполнению" })
		.email({ message: "Некорректный Email" }),
	password: z
		.string({ required_error: "Пароль обязателен к заполнению" })
		.min(8, { message: "Пароль должен содержать не менее 8 символов" }),
});
