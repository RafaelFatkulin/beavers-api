import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./user.schema";

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
