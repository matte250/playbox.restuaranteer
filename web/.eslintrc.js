module.exports = {
	parser: '@typescript-eslint/parser', // Specifies the ESLint parser
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
		'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array
		'plugin:react/recommended',
		'airbnb',
	],
	rules: {
		'react/jsx-filename-extension': [
			2,
			{ extensions: ['.js', '.jsx', '.ts', '.tsx'] },
		],
		indent: ['error', 'tab'],
		'no-tabs': ['off'],
		'import/extensions': ['error', { ts: 'never', js: 'never' }],
		'react/jsx-indent': [
			'error',
			'tab',
			{ checkAttributes: true, indentLogicalExpressions: true },
		],
		'react/jsx-indent-props': ['error', 'tab'],
		'react/react-in-jsx-scope': 'off',
	},
};
