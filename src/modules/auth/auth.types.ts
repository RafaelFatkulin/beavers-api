import { z } from "zod";
import {
	createRefreshTokenSchema,
	refreshSchema,
	signinSchema,
	signoutSchema,
	signupSchema,
} from "./auth.schema";

export type SignIn = z.infer<typeof signinSchema>;
export type SignUp = z.infer<typeof signupSchema>;
export type SignOut = z.infer<typeof signoutSchema>;
export type Refresh = z.infer<typeof refreshSchema>;
export type CreateRefreshToken = z.infer<typeof createRefreshTokenSchema>;
