import { prisma } from "@core/db";
import { CreateRefreshToken } from "./auth.types";

export const createRefreshToken = async ({
	token,
	userId,
	expiresAt,
}: CreateRefreshToken) => {
	return await prisma.refreshToken.create({
		data: {
			token,
			userId,
			expiresAt,
		},
	});
};

export const getRefreshToken = async (token: string, revoked?: boolean) => {
	return await prisma.refreshToken.findFirst({
		where: {
			token,
			revoked,
		},
	});
};

export const revokeRefreshToken = async (id: number) => {
	return await prisma.refreshToken.update({
		where: {
			id,
		},
		data: {
			revoked: true,
		},
	});
};
