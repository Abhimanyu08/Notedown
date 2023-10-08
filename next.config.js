/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
	},
	reactStrictMode: process.env.NODE_ENV === "production",
	swcMinify: true,
	images: {
		domains: ["newnblwzrgvnhplztbua.supabase.co", "localhost"],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

module.exports = nextConfig;
