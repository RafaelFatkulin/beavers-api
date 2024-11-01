import { z } from "zod";
import { createUserSchema, searchUserSchema, updateUserSchema } from "./user.schema";

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SearchUser = z.infer<typeof searchUserSchema>;