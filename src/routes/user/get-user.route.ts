import { Hono } from "hono";
import { excludeFromObject, prisma } from "../../helpers";

export const getUser = new Hono();

getUser.get("/:id", async (c) => {
  return c.json(
    await prisma.user.findUnique({
      where: {
        id: Number(c.req.param("id")),
      },
    })
  );
});
