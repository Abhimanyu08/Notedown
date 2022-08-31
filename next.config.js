/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	swcMinify: true,
	images: {
		domains: [
			"avatars.githubusercontent.com",
			"newnblwzrgvnhplztbua.supabase.co",
		],
	},
};

module.exports = nextConfig;
