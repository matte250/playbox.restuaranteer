import { emailRegex } from './regex.js';
import { createValidatorFunctions } from './validator.js';

export const validators = createValidatorFunctions({
	isEmail: {
		func: (value) => !emailRegex.test(value),
		msg: 'Invalid email address',
	},
	isPassword: {
		func: (value) => !/\S{6,128}/.test(value),
		msg: 'Password needs to be 6 to 128 characters long',
	},
	isGoogleMapsLink: {
		func: (value) =>
			!/(https|http):\/\/(www\.|)google\.[a-z]+\/maps/.test(value),
		msg: 'Needs to be a valid Google Maps link',
	},
});
