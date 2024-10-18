import { z } from "zod";
import { minimalLengthMessage, requiredMessage } from "../../helpers/zod";

const TITLE_MIN_LENGTH = 4;

export const categoryDtoSchema = z.object({
	title: z
		.string({ message: requiredMessage("Название") })
		.min(
			TITLE_MIN_LENGTH,
			minimalLengthMessage({ title: "Название", length: TITLE_MIN_LENGTH })
		),
	description: z.string(),
});
