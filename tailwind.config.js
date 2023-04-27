/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			dropShadow: {
				cyan: "5px 5px 5px #06b6d4",
				red: "-5px 5px 5px #f43f5e",
				blue: "5px 5px 5px #2563eb",
			},
			colors: {
				"light-white": "rgb(239, 239, 239)",
				"font-grey": "rgb(163, 163,163)",
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
