import { Hono } from "hono";
import { createErrorResponse, createSuccessResponse, excludeFromList, excludeFromObject, prisma } from "../../helpers";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema, updateUserSchema } from "./user.schema";

export const users = new Hono().basePath("/users");

users
  .get("/", async (c) => {
    return c.json(
      createSuccessResponse({
        data: excludeFromList(await prisma.user.findMany(), [
          "password",
          "updatedAt",
          "createdAt",
        ]),
      })
    );
  })
  .get("/:id", async (c) => {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(c.req.param("id")),
      },
    });
  
    if (!user) {
      return c.json(createErrorResponse({
        message: "Пользователь не найден",
      }))
    }  

    return c.json(createSuccessResponse({
      data: user
    }))
  })
  .post(
    "/",
    zValidator("json", createUserSchema, (result, c) => {
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
        data: excludeFromObject(user, ["password", "updatedAt", "createdAt"]),
      }, 201);
    }
  )
  .on(
    ['PATCH', 'PUT'], 
    '/:id', 
    zValidator(
      "json", 
      updateUserSchema, 
      (result, c) => {
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
      const data = c.req.valid("json");

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(c.req.param("id")),
        },
      });
    
      if (!existingUser) {
        return c.json({
          success: false,
          message: "Пользователь не найден",
          data: null,
        }, 404);
      }  

      const user = await prisma.user.update({
        where: {
          id: existingUser.id
        },
        data
      })

      return c.json(createSuccessResponse({
        data: excludeFromObject(user, ["password", "updatedAt", "createdAt"]),
        message: "Пользователь успешно обновлен"
      }))
    })
  .delete('/:id', async (c) => {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(c.req.param("id")),
      },
    });
  
    if (!existingUser) {
      return c.json({
        success: false,
        message: "Пользователь не найден",
        data: null,
      }, 404);
    }  

    const user = await prisma.user.delete({
      where: {
        id: existingUser.id
      }
    }) 

    return c.json({
      success: true,  
      message: "Пользователь успешно удален",
      data: user
    });
  });
