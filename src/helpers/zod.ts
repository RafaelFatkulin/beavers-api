const getWordForm = (number: number, words: [string, string, string]) => {
	const mod100 = number % 100;
	const mod10 = number % 10;

	if (mod100 >= 11 && mod100 <= 19) {
		return words[2];
	}

	if (mod10 === 1) {
		return words[0];
	}

	if (mod10 >= 2 && mod10 <= 4) {
		return words[1];
	}

	return words[2];
};

export const requiredMessage = (title: string) =>
	`Поле "${title}" обязательно к заполнению`;
export const minimalLengthMessage = ({
	title,
	length,
}: {
	title: string;
	length: number;
}) =>
	`Минимальная длина поля "${title}" - ${length} ${getWordForm(length, [
		"символ",
		"символа",
		"символов",
	])}`;
