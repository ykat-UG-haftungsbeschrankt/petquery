import tseslint from 'typescript-eslint';

const COPYRIGHT_HEADER = [
	'/*',
	' * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved',
	' *',
	' * Permission for non-commercial use is hereby granted,',
	' * free of charge, without warranty of any kind.',
	' */',
	''
].join('\n');

// Requires every file to start with COPYRIGHT_HEADER and a blank line.
const copyrightHeaderRule = {
	meta: {
		type: 'problem',
		fixable: 'code',
		messages: {
			missing: 'File must start with the copyright header.'
		},
		schema: []
	},
	create(context){
		return {
			Program(node){
				const text = context.sourceCode.getText();
				if(text.startsWith(COPYRIGHT_HEADER + '\n')){
					return;
				}
				context.report({
					node,
					loc: {line: 1, column: 0},
					messageId: 'missing',
					fix(fixer){
						return fixer.insertTextBeforeRange(
							[0, 0],
							COPYRIGHT_HEADER + '\n'
						);
					}
				});
			}
		};
	}
};

// Checks for unused code (names starting with UNUSED_ are ignored) and for
// the copyright header.
export default tseslint.config(
	{
		ignores: ['dist/**', 'doc/**', 'node_modules/**', '**/.trash/**']
	},
	{
		files: ['**/*.ts'],
		extends: [tseslint.configs.base],
		plugins: {
			petquery: {rules: {'copyright-header': copyrightHeaderRule}}
		},
		rules: {
			'petquery/copyright-header': 'error',
			'@typescript-eslint/no-unused-vars': ['error', {
				vars: 'all',
				args: 'all',
				caughtErrors: 'all',
				varsIgnorePattern: '^UNUSED_',
				argsIgnorePattern: '^UNUSED_',
				caughtErrorsIgnorePattern: '^UNUSED_',
				destructuredArrayIgnorePattern: '^UNUSED_'
			}]
		}
	}
);
