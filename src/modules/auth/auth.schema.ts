import { minimalLengthMessage, requiredMessage } from "@core/helpers";
import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const FULL_NAME_MIN_LENGTH = 10;

const fullNameSchema = z
	.string({ required_error: requiredMessage("ФИО") })
	.min(
		FULL_NAME_MIN_LENGTH,
		minimalLengthMessage({ title: "ФИО", length: FULL_NAME_MIN_LENGTH })
	);

const emailSchema = z
	.string({ required_error: requiredMessage("Email") })
	.email({ message: "Некорректный Email" });

const passwordSchema = z
	.string({ required_error: requiredMessage("Пароль") })
	.min(PASSWORD_MIN_LENGTH, {
		message: minimalLengthMessage({
			title: "Пароль",
			length: PASSWORD_MIN_LENGTH,
		}),
	});

export const signinSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export const signupSchema = z.object({
	fullName: fullNameSchema,
	email: emailSchema,
	password: passwordSchema,
	role: z.enum(["ADMIN", "LOGISTICIAN", "MANAGER"]).optional(),
});

export const signoutSchema = z.object({
	refreshToken: z.string().optional(),
});

export const refreshSchema = signoutSchema;

export const createRefreshTokenSchema = z.object({
	token: z.string(),
	userId: z.number(),
	expiresAt: z.date(),
});
