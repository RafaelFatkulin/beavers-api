import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { users } from "./routes/user";
import { auth } from "./routes/auth";
import { createErrorResponse } from "./helpers";
import { HTTPException } from "hono/http-exception";

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
app.route("/", auth);

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		console.log({ err });

		const status = err.getResponse().status;
		console.log(status);

		if (status === 401) {
			return c.json(createErrorResponse({ message: "Unauthorized" }), status);
		}

		if (status === 403) {
			return c.json(createErrorResponse({ message: "Forbidden" }), status);
		}

		if (status === 404) {
			return c.json(createErrorResponse({ message: err.message }), status);
		}
	}

	return c.json(createErrorResponse({ message: err.message }), 500);
});

app.notFound((c) => {
	return c.json(createErrorResponse({ message: "Route not found" }), 404);
});

export default app;
