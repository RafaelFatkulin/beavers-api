import { z } from "zod";
import { createCategorySchema, updateCategorySchema } from "./category.schema";

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
