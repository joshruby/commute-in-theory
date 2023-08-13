const typography = require('@tailwindcss/typography');
/** @type {import('tailwindcss').Config}*/
const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
			'baby-blue': '#a4c2f4'
		  }
		}
	},

	plugins: [typography]
};

module.exports = config;
