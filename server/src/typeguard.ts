import { emailRegex } from './validation/regex';

export class ITypeGuard<T> {
	constructor(readonly value: T) {}
}

export class Email implements ITypeGuard<string> {
	readonly value: string;
	constructor(x: unknown) {
		const str = stringTypeGuard(x);
		if (emailRegex.test(str)) this.value = str;
		else throw TypeError(`${x} is not a valid email`);
	}
}

export const stringTypeGuard = (value: unknown) => {
	if (typeof value === 'string') return value;
	else throw TypeError(`${value}(${typeof value}) is not a string`);
};

export const numberTypeGuard = (value: unknown) => {
	if (typeof value === 'number') return value;

	if (typeof value === 'string') {
		const parsedValue = parseFloat(value);
		if (parsedValue !== NaN) return parsedValue;
	}

	throw TypeError(`${value}(${typeof value}) is not a number`);
};
