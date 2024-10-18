import { z } from "zod";
import { minimalLengthMessage, requiredMessage } from "../../helpers/zod";

const TITLE_MIN_LENGTH = 2;

export const createProductSchema = z.object({
	title: z
		.string({ message: requiredMessage("Название") })
		.min(TITLE_MIN_LENGTH, {
			message: minimalLengthMessage({
				title: "Название",
				length: TITLE_MIN_LENGTH,
			}),
		}),
	description: z.string({
		message: requiredMessage("Описание"),
	}),
});
