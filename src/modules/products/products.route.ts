import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { searchProductSchema } from "@modules/products/products.schema";
import { Product } from "@prisma/client";
import { getProducts } from "@modules/products/products.service";
import { HTTPException } from "hono/http-exception";
import { createSuccessResponse } from "@core/helpers";

export const products = new Hono();

// GET ALL PRODUCTS
products.get(
	"/",
	zValidator("query", searchProductSchema),
	async (c) => {
		const { q, categoryId } = c.req.valid("query");

		const products: Product[] = await getProducts({ q, categoryId });

		if (!products.length) {
			throw new HTTPException(404, {
				message: "Продукты не найдены"
			});
		}

		return c.json(
			createSuccessResponse<Product[]>({
				data: products
			})
		);
	}
);