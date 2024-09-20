import { Hono } from "hono";
import { prisma } from "../../helpers";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const users = new Hono().basePath("/users");

const createUserSchema = z.object({
  fullName: z.string({ required_error: "FullName required" }),
  email: z
    .string({ required_error: "Email required" })
    .email({ message: "Некорректный Email" }),
  password: z
    .string({ required_error: "Password required" })
    .min(8, { message: "Пароль должен содержать не менее 8 символов" }),
});

users
  .get("/", async (c) => {
    const users = await prisma.user.findMany();
    return c.json(users);
  })
  .get("/:id", async (c) => {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(c.req.param("id")),
      },
    });
    return c.json(user);
  })
  .post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
      if (!result.success) {
        const errors = Object.create({});

        for (const issue in result.error.issues) {
          const key = result.error.issues[issue].path[0];
          errors[key] = result.error.issues[issue].message;
        }

        return c.json({
          success: false,
          error: errors,
        });
      }
    }),
    async (c) => {
      const data = c.req.valid("json");

      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

      if (existingUser) {
        return c.json(
          {
            success: false,
            message: "Пользователь с таким email уже существует",
            data: null,
          },
          400
        );
      }

      const user = await prisma.user.create({
        data: {
          ...data,
          role: "MANAGER",
        },
      });

      return c.json({
        success: true,
        message: "Пользователь успешно создан",
        data: user,
      });
    }
  );
