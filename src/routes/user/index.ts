import { Hono } from "hono";
import { prisma } from "../../helpers";
import { createUser } from "./create-user.route";
import { getUsers } from "./get-users.route";

export const users = new Hono().basePath("/users");

users
  .route("/", getUsers)

  .route("/", createUser);
