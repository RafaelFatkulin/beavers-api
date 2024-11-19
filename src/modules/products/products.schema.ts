import { z } from "zod";
import { minimalLengthMessage, requiredMessage } from "@core/helpers";

const TITLE_MIN_LENGTH = 3;
const DESC_MIN_LENGTH = 3;
const UNIT_MIN_LENGTH = 3;

const titleSchema = z
	.string({ required_error: requiredMessage("Название") })
	.min(TITLE_MIN_LENGTH, {
		message: minimalLengthMessage({
			title: "Название",
			length: TITLE_MIN_LENGTH
		})
	});

const descriptionSchema = z
	.string({ required_error: requiredMessage("Описание") })
	.min(DESC_MIN_LENGTH, {
		message: minimalLengthMessage({
			title: "Описание",
			length: DESC_MIN_LENGTH
		})
	});

const unitSchema = z
	.string({ required_error: requiredMessage("Единица") })
	.min(UNIT_MIN_LENGTH, {
		message: minimalLengthMessage({
			title: "Единица",
			length: UNIT_MIN_LENGTH
		})
	});

const categoryIdSchema = z
	.number({ required_error: requiredMessage("Категория") });

export const createProductSchema = z.object({
	title: titleSchema,
	description: descriptionSchema.optional(),
	unit: unitSchema,
	categoryId: categoryIdSchema
});

export const updateProductSchema = z.object({
	title: titleSchema.optional(),
	description: descriptionSchema.optional(),
	unit: unitSchema.optional(),
	categoryId: categoryIdSchema.optional()
});

export const searchProductSchema = z.object({
	q: z.string().optional(),
	categoryId: categoryIdSchema.optional()
});