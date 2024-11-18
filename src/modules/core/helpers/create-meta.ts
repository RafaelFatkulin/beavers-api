export const createMeta = ({
	total,
	page,
	limit
}: { total: number, page: number, limit: number }) => {
	return {
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit)
	};
};