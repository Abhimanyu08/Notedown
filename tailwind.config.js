/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	darkMode: "class",
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-sans)"],
				mono: ["var(--font-mono)"],
				serif: ["var(--font-serif)"],
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
