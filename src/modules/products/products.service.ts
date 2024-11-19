import { prisma } from "@core/db";
import { CreateProduct, SearchProduct, UpdateProduct } from "@modules/products/products.types";

export const getCountOfProducts = async ({ q, categoryId }: SearchProduct) => {
	return prisma.product.count({
		where: {
			AND: [
				{
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ description: { contains: q, mode: "insensitive" } }
					]
				},
				categoryId ? { categoryId } : {}
			]
		}
	});
};

export const getProducts = ({ q, categoryId }: SearchProduct) => {
	return prisma.product.findMany({
		where: {
			AND: [
				{
					OR: [
						{ title: { contains: q, mode: "insensitive" } },
						{ description: { contains: q, mode: "insensitive" } }
					]
				},
				categoryId ? { categoryId } : {}
			]
		}
	});
};

export const getProductById = async (id: number) => {
	return prisma.product.findUnique({ where: { id } });
};

export const getProductByTitle = async (title: string) => {
	return prisma.product.findFirst({ where: { title } });
};

export const createProduct = async ({
	title,
	description = "",
	unit,
	categoryId
}: CreateProduct) => {
	return prisma.product.create({
		data: {
			title,
			description,
			unit,
			categoryId
		}
	});
};

export const updateProduct = async (id: number, data: UpdateProduct) => {
	return prisma.product.update({
		where: { id },
		data
	});
};

export const deleteProduct = async (id: number) => {
	return prisma.product.delete({ where: { id } });
};