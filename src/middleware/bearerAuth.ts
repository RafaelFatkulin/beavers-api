import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { createErrorResponse } from "../helpers";

export const verifyToken = async(token: string, secret: string) => {
    try {
        return await verify(token, secret)
    } catch (error: any) {
        return null
    }
}

export const authMiddleware = async (c: Context, next: Next, requiredRole: string) => {
    const token = c.req.header("Authorization");
    console.log(token);
    

    if(!token) {
        return c.json(
            createErrorResponse({
                message: "Токен не передан"
            }),
            401
        )
    }

    const decoded = await verifyToken(token, Bun.env.JWT_SECRET as string);
    console.log(decoded);

    if(!decoded) {
        return c.json(
            createErrorResponse({
                message: "Токен недействителен"
            }),
            401
        )
    }

    return next()
}