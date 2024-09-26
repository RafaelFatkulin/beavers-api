import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { createErrorResponse } from "../helpers";
import { Role } from "@prisma/client";

export const verifyToken = async(token: string, secret: string) => {
    try {
        return await verify(token, secret)
    } catch (error: any) {
        return null
    }
}

// TODO: ADD MULTIPLE ROLES HERE
export const authMiddleware = async (c: Context, next: Next, requiredRole: string) => {
    const token = c.req.header("Authorization")?.split(' ')[1];

    if(!token) {
        return c.json(
            createErrorResponse({
                message: "Токен не передан"
            }),
            401
        )
    }

    const decoded = await verifyToken(token, Bun.env.JWT_SECRET as string);
    console.log('decoded',decoded);

    if(!decoded) {
        return c.json(
            createErrorResponse({
                message: "Токен недействителен"
            }),
            401
        )
    }

    if(decoded.role !== requiredRole) {
        return c.json(
            createErrorResponse({
                message: "Доступ запрещен"
            }),
            403
        )
    }

    return next()
}