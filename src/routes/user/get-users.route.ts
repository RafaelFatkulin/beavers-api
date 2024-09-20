import { Hono } from "hono";
import { excludeFromList, prisma } from "../../helpers";

export const getUsers = new Hono();

getUsers.get("/", async (c) => {
  return c.json(
    excludeFromList(await prisma.user.findMany(), [
      "password",
      "updatedAt",
      "createdAt",
    ])
  );
});
