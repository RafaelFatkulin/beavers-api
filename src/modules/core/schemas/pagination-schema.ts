import { z } from "zod";

export const paginationSchema = z.object({
	page: z.string().optional(),
	limit: z.string().optional()
});