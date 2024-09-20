import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { users } from "./routes/user";

const app = new Hono();

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.route("/", users);

export default app;
