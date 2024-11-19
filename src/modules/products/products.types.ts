import {
	createProductSchema,
	searchProductSchema,
	updateProductSchema
} from "@modules/products/products.schema";
import { z } from "zod";

export type CreateProduct = z.infer<typeof createProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
export type SearchProduct = z.infer<typeof searchProductSchema>