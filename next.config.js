/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: process.env.NODE_ENV === "production",
	swcMinify: true,
	images: {
		domains: ["newnblwzrgvnhplztbua.supabase.co", "localhost"],
	},
	typescript: {
		// ignoreBuildErrors: true,
	},
	experimental: {
		// ppr: true,
	},
};

module.exports = nextConfig;
