import { IValidationDef } from '../validator';

interface ITestValidatorItem {
	name: string;
	email: string;
	telephoneNumbers: {
		number: string;
		countryCode: string;
	}[];
}
const TestValidatorItem: Partial<ITestValidatorItem> = {
	name: 'Wattson',
	email: 'wattson.grey@gmail.com',
	telephoneNumbers: [],
};

const TestValidatorItemInvalidEmail: Partial<ITestValidatorItem> = {
	name: 'Wattson',
	email: 'rawr xD',
	telephoneNumbers: [],
};

const testValidatorDef: IValidationDef = {
	name: { $req: true },
	email: {
		$req: true,
		//$: "emailRegex",
	},
	telephoneNumbers: {
		$map: {
			number: { $req: true },
			countryCode: { $: 'countrycodevalidator' },
		},
		$brk: true,
	},
	//$: "somevalidation on whole object"
};
