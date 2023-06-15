/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/profile/:id/posts",
				destination: "/profile/:id/posts/latest",
				permanent: true,
			},
		];
	},
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
			"lexica-serve-encoded-images.sharif.workers.dev",
		],
	},
};

module.exports = nextConfig;
