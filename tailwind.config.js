/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			animation: {
				fade: "pulse 3s linear 1",
			},
		},
	},
	plugins: [
		require("daisyui"),
		require("@tailwindcss/typography"),
		require("tailwind-scrollbar"),
	],
	corePlugins: {
		preflight: true,
	},
};
