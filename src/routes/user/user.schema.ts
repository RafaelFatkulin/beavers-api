import { z } from "zod";

export const createUserSchema = z.object({
    fullName: z.string({ required_error: "ФИО обязательно для заполнения" }),
    email: z
        .string({ required_error: "Email required" })
        .email({ message: "Некорректный Email" }),
    password: z
        .string({ required_error: "Password required" })
        .min(8, { message: "Пароль должен содержать не менее 8 символов" }),
});

export const updateUserSchema = z.object({
    fullName: z.string({ required_error: "ФИО обязательно для заполнения" }).optional(),
    email: z
        .string({ required_error: "Email required" })
        .email({ message: "Некорректный Email" }).optional(),
}) 