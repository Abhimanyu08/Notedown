/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/appprofile/:id/posts",
				destination: "/appprofile/:id/posts/latest",
				permanent: true,
			},
		];
	},
	experimental: {
		appDir: true,
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
