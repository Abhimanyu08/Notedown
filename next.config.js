/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
		serverActions: true,
	},
	reactStrictMode: process.env.NODE_ENV === "production",
	swcMinify: true,
	images: {
		domains: ["newnblwzrgvnhplztbua.supabase.co", "localhost"],
	},
};

module.exports = nextConfig;
