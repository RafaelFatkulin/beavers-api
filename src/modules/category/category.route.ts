import { Hono } from "hono";
import {
	createCategory,
	deleteCategory,
	getAllCategories,
	getCategoryById,
	getCountOfCategories,
	updateCategory
} from "./category.service";
import { HTTPException } from "hono/http-exception";
import { createSuccessResponse } from "@core/helpers";
import { authMiddleware } from "@modules/auth";
import { zValidator } from "@hono/zod-validator";
import { createCategorySchema, updateCategorySchema } from "./category.schema";
import { paginationSchema } from "@core/schemas";
import { createMeta } from "@core/helpers/create-meta";

export const category = new Hono();

category
	.get(
		"/",
		(c, next) => authMiddleware(c, next, ["ADMIN"]),
		zValidator("query", paginationSchema),
		async (c) => {
			const { page = "1", limit = "10" } = c.req.valid("query");

			const skip = (parseInt(page) - 1) * parseInt(limit);

			const categories = await getAllCategories({
				skip,
				take: parseInt(limit)
			});

			const total = await getCountOfCategories();

			if (!categories.length) {
				throw new HTTPException(404, { message: "Категории не найдены" });
			}

			return c.json(createSuccessResponse({
				data: categories,
				meta: createMeta({
					total,
					page: parseInt(page),
					limit: parseInt(limit)
				})
			}));
		}
	)
	.get(
		"/:id",
		(c, next) => authMiddleware(c, next),
		async (c) => {
			const category = await getCategoryById(Number(c.req.param("id")));

			if (!category) {
				throw new HTTPException(404, { message: "Категория не найдена" });
			}

			return c.json(createSuccessResponse({ data: category }));
		}
	)
	.post(
		"/",
		(c, next) => authMiddleware(c, next, ["ADMIN"]),
		zValidator("json", createCategorySchema),
		async (c) => {
			const { title, description } = c.req.valid("json");

			const category = await createCategory({ title, description });

			if (!category) {
				throw new HTTPException(400, {
					message: "Произошла ошибка при создании категории"
				});
			}

			return c.json(createSuccessResponse({
				data: category,
				message: `Категория "${category.title}" создана`
			}));
		}
	)
	.on(
		["PATCH", "PUT"],
		"/:id",
		(c, next) => authMiddleware(c, next, ["ADMIN"]),
		zValidator("json", updateCategorySchema),
		async (c) => {
			const { title, description } = c.req.valid("json");

			console.log({
				title,
				description
			});

			const existingCategory = await getCategoryById(Number(c.req.param("id")));

			if (!existingCategory) {
				throw new HTTPException(404, { message: "Категория не найдена" });
			}

			const updatedCategory = await updateCategory(existingCategory.id, {
				title,
				description
			});

			if (!updatedCategory) {
				throw new HTTPException(400, {
					message: "Произошла ошибка при обновлении категории"
				});
			}

			return c.json(createSuccessResponse({ data: updatedCategory }));
		}
	)
	.delete(
		"/:id",
		(c, next) => authMiddleware(c, next, ["ADMIN"]),
		async (c) => {
			const category = await getCategoryById(Number(c.req.param("id")));

			if (!category) {
				throw new HTTPException(404, { message: "Категория не найдена" });
			}

			await deleteCategory(Number(c.req.param("id")));

			return c.json(createSuccessResponse({ message: "Категория удалена" }));
		}
	);
