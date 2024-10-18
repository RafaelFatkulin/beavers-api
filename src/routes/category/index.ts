import { Hono } from "hono";
import { createSuccessResponse, excludeFromList, prisma } from "../../helpers";
import { HTTPException } from "hono/http-exception";

export const categories = new Hono().basePath("/categories");

categories
	.get("/", async (c) => {
		return c.json(
			createSuccessResponse({
				data: excludeFromList(await prisma.category.findMany(), [
					"createdAt",
					"updatedAt",
				]),
			})
		);
	})
	.get("/:id", async (c) => {
		const category = await prisma.category.findUnique({
			where: {
				id: Number(c.req.param("id")),
			},
		});

		if (!category) {
			throw new HTTPException(404, { message: "Такая категория не найдена" });
		}
	});
