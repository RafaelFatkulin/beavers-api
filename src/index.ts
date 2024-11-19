import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { createErrorResponse } from "@core/helpers";
import { auth } from "@modules/auth";
import { users } from "@modules/user";
import { category } from "@modules/category";
import { products } from "@modules/products";

const app = new Hono();

app.use("*", logger());
app.use("*", prettyJSON());
app.use(
	"*",
	cors({
		origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
		allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
		credentials: true
	})
);

app.route("/users", users);
app.route("/auth", auth);
app.route("/categories", category);
app.route("/products", products);

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		console.log({ err });

		const status = err.getResponse().status;
		console.log(status);

		if (status === 401) {
			return c.json(createErrorResponse({ message: "Unauthorized" }), status);
		}

		if (status === 403) {
			return c.json(
				createErrorResponse({ message: "Недостаточно прав для действия" }),
				status
			);
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

export default {
	port: 8001,
	fetch: app.fetch
};
