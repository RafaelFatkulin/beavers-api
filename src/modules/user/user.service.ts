import { prisma } from "@core/db";
import { CreateUser, SearchUser, UpdateUser } from "./user.types";

export const generatePassword = (length: number = 12) => {
	const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
	const numbers = "0123456789";
	const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

	const allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;
	let password = [
		upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)],
		lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)],
		numbers[Math.floor(Math.random() * numbers.length)],
		specialChars[Math.floor(Math.random() * specialChars.length)]
	];

	for (let i = password.length; i < length; i++) {
		password.push(allChars[Math.floor(Math.random() * allChars.length)]);
	}

	return password.sort(() => Math.random() - 0.5).join("");
};

export const getAllUsers = async () => {
	return prisma.user.findMany();
};
export const searchUsers = async ({ q, role }: SearchUser) => {
	return prisma.user.findMany({
		where: {
			AND: [
				{
					OR: [
						{ fullName: { contains: q, mode: "insensitive" } },
						{ email: { contains: q, mode: "insensitive" } }
					]
				},
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
	email,
	role
}: CreateUser) => {
	return prisma.user.create({
		data: {
			fullName,
			password: await Bun.password.hash("password", "bcrypt"),
			email,
			role: role || "MANAGER"
		}
	});
};
export const updateUser = async (id: number, { fullName, email, role }: UpdateUser) => {
	return prisma.user.update({
		where: { id },
		data: { fullName, email, role }
	});
};
export const deleteUser = async (id: number) => {
	return prisma.user.delete({ where: { id } });
};
