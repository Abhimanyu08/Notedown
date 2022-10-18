/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: [
			"avatars.githubusercontent.com",
			"newnblwzrgvnhplztbua.supabase.co",
			"lh3.googleusercontent.com",
			"image.lexica.art",
		],
	},
};

module.exports = nextConfig;
