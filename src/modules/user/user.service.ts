import { prisma } from "@core/db";
import { CreateUser, SearchUser, UpdateUser } from "./user.types";

export const getAllUsers = async () => {
	return prisma.user.findMany();
};
export const searchUsers = async ({ q, role }: SearchUser) => {
	return prisma.user.findMany({
		where: {
			AND: [
				{ fullName: { contains: q, mode: "insensitive" } },
				{ email: { contains: q, mode: "insensitive" } },
				role !== "ALL" ? { role } : {}
			]
		}
	});
};
export const getUserByEmail = async (email: string) => {
	return prisma.user.findUnique({ where: { email } });
};
export const getUserById = async (id: number) => {
	return prisma.user.findUnique({ where: { id } });
};
export const createUser = async ({
	fullName,
	password,
	email,
	role
}: CreateUser) => {
	return prisma.user.create({
		data: {
			fullName,
			password: await Bun.password.hash(password, "bcrypt"),
			email,
			role: role || "MANAGER"
		}
	});
};
export const updateUser = async ({ fullName, email, role }: UpdateUser) => {
	return prisma.user.update({
		where: { email },
		data: { fullName, email, role }
	});
};
export const deleteUser = async (id: number) => {
	return prisma.user.delete({ where: { id } });
};
