import { prisma } from "@core/db";
import { CreateCategory, UpdateCategory } from "./category.types";

export const getAllCategories = async () => {
	return await prisma.category.findMany();
};

export const getCategoryById = async (id: number) => {
	return await prisma.category.findUnique({ where: { id } });
};

export const getCategoryByTitle = async (title: string) => {
	return await prisma.category.findUnique({ where: { title } });
};

export const createCategory = async ({
	title,
	description = ""
}: CreateCategory) => {
	return prisma.category.create({ data: { title, description } });
};

export const updateCategory = async (
	id: number,
	{ title, description }: UpdateCategory
) => {
	return await prisma.category.update({
		where: { id },
		data: { title, description }
	});
};

export const deleteCategory = async (id: number) => {
	return await prisma.category.delete({ where: { id } });
};
