import { prisma } from "@core/db";
import { CreateCategory, UpdateCategory } from "./category.types";

export const getCountOfCategories = async () => await prisma.category.count();

export const getAllCategories = async ({ skip, take }: { skip: number, take: number }) => {
	return prisma.category.findMany({
		skip,
		take
	});
};

export const getCategoryById = async (id: number) => {
	return prisma.category.findUnique({ where: { id } });
};

export const getCategoryByTitle = async (title: string) => {
	return prisma.category.findUnique({ where: { title } });
};

export const createCategory = async ({
	title,
	description = ""
}: CreateCategory) => {
	const existingCategory = await getCategoryByTitle(title);

	if (existingCategory) {
		throw new Error(`Категория с названием "${title}" уже существует`);
	}

	return prisma.category.create({ data: { title, description } });
};

export const updateCategory = async (
	id: number,
	{ title, description }: UpdateCategory
) => {
	return prisma.category.update({
		where: { id },
		data: { title, description }
	});
};

export const deleteCategory = async (id: number) => {
	return prisma.category.delete({ where: { id } });
};
