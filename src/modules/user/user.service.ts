import { prisma } from "@core/db";
import { CreateUser, UpdateUser } from "./user.types";

export const getAllUsers = async () => {
	return await prisma.user.findMany();
};
export const getUserByEmail = async (email: string) => {
	return await prisma.user.findUnique({ where: { email } });
};
export const getUserById = async (id: number) => {
	return await prisma.user.findUnique({ where: { id } });
};
export const createUser = async ({
	fullName,
	password,
	email,
	role,
}: CreateUser) => {
	return await prisma.user.create({
		data: {
			fullName,
			password: await Bun.password.hash(password, "bcrypt"),
			email,
			role: role || "MANAGER",
		},
	});
};
export const updateUser = async ({ fullName, email, role }: UpdateUser) => {
	return await prisma.user.update({
		where: { email },
		data: { fullName, email, role },
	});
};
export const deleteUser = async (id: number) => {
	return await prisma.user.delete({ where: { id } });
};
