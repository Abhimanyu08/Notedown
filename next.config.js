/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
		serverActions: true,
	},
	reactStrictMode: process.env.NODE_ENV === "production",
	swcMinify: true,
	images: {
		domains: [
			"avatars.githubusercontent.com",
			"newnblwzrgvnhplztbua.supabase.co",
			"lh3.googleusercontent.com",
			"image.lexica.art",
			"oaidalleapiprodscus.blob.core.windows.net",
		],
	},
};

module.exports = nextConfig;
