import { z } from "zod";
import { minimalLengthMessage, requiredMessage } from "@core/helpers";

const TITLE_MIN_LENGTH = 3;

const titleSchema = z
	.string({ required_error: requiredMessage("Название") })
	.min(TITLE_MIN_LENGTH, {
		message: minimalLengthMessage({
			title: "Название",
			length: TITLE_MIN_LENGTH
		})
	});

const descriptionSchema = z.string().optional();

export const createCategorySchema = z.object({
	title: titleSchema,
	description: descriptionSchema
});

export const updateCategorySchema = z.object({
	title: titleSchema.optional(),
	description: descriptionSchema
});
