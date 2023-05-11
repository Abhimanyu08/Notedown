/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	darkMode: "class",
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			dropShadow: {
				button: "3px 3px 2px #ffffff",
			},
			colors: {
				"light-white": "rgb(239, 239, 239)",
				"font-grey": "rgb(163, 163,163)",
			},
		},
	},
	plugins: [
		// require("daisyui"),
		require("@tailwindcss/typography"),
		require("tailwind-scrollbar"),
	],
	corePlugins: {
		preflight: true,
	},
};
