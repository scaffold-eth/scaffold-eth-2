const path = require('path');

const buildEslintCommand = (filenames) =>
	`yarn next:lint --fix --file ${filenames
		.map((f) => path.relative(path.join('packages','frontend'), f))
		.join(' --file ')}`;

console.log(buildEslintCommand);

module.exports = {
	'packages/frontend/**/*.{ts,tsx}': [buildEslintCommand],
};
