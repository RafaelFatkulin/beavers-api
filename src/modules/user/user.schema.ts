import { minimalLengthMessage, requiredMessage } from "@core/helpers";
import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

const fullNameSchema = z.string({ required_error: requiredMessage("ФИО") });
const emailSchema = z
	.string({ required_error: requiredMessage("Email") })
	.email({ message: "Некорректный Email" });
const passwordSchema = z
	.string({ required_error: requiredMessage("Пароль") })
	.min(
		PASSWORD_MIN_LENGTH,
		minimalLengthMessage({ title: "Пароль", length: PASSWORD_MIN_LENGTH })
	);

export const userRoleSchema = z.enum(["ADMIN", "MANAGER", "LOGISTICIAN"]);

export const createUserSchema = z.object({
	fullName: fullNameSchema,
	email: emailSchema,
	password: passwordSchema,
	role: userRoleSchema.optional()
});

export const updateUserSchema = z.object({
	fullName: fullNameSchema.optional(),
	email: emailSchema.optional(),
	role: userRoleSchema.optional()
});

export const searchUserSchema = z.object({
	q: z.string().optional(),
	role: userRoleSchema.or(z.enum(["ALL"])).optional()
});