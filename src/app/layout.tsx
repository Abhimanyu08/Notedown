import Navbar from "@components/Navbar/Navbar";
import "@/styles/globals.css";
import "@/styles/xterm.css";
import { Metadata } from "next";
import SupabaseProvider from "./AppContext";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
export const metadata: Metadata = {
	title: "Rce-blog",
	description:
		"Write posts/notes containing prose, executable code snippets, free hand drawings and images.",
	twitter: {
		title: "Rce-blog",
		description:
			"Write posts/notes containing prose, executable code snippets, free hand drawings and images.",
		card: "summary",
	},
	openGraph: {
		url: "http://rce-blog.xyz",
		type: "website",
		title: "Rce-blog",
		description:
			"Write posts/notes containing prose, executable code snippets, free hand drawings and images.",
	},
};

export default async function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = createServerComponentSupabaseClient({
		headers,
		cookies,
	});

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<html lang="en" className="dark">
			<body className="flex flex-col h-screen w-full bg-gray-200 dark:bg-black transition-colors duration-300">
				<SupabaseProvider session={session}>
					<Navbar />

					{children}
				</SupabaseProvider>
			</body>
		</html>
	);
}
// <Head>
// 				{/* <!-- HTML Meta Tags --> */}
// 				<title>RCE-Blog</title>
// 				<meta
// 					name="description"
// 					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
// 				/>

// 				{/* <!-- Facebook Meta Tags --> */}
// 				<meta property="og:url" content="https://rce-blog.xyz/" />
// 				<meta property="og:type" content="website" />
// 				<meta property="og:title" content="RCE-Blog" />
// 				<meta
// 					property="og:description"
// 					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
// 				/>
// 				<meta
// 					property="og:image"
// 					content="https://rce-blog.xyz/api/og"
// 				/>

// 				{/* <!-- Twitter Meta Tags --> */}
// 				<meta name="twitter:card" content="summary_large_image" />
// 				<meta property="twitter:domain" content="rce-blog.xyz" />
// 				<meta property="twitter:url" content="https://rce-blog.xyz" />
// 				<meta name="twitter:title" content="RCE-Blog" />
// 				<meta
// 					name="twitter:description"
// 					content="Write posts/notes containing prose, executable code snippets, free hand drawings and images."
// 				/>
// 				<meta
// 					name="twitter:image"
// 					content="https://rce-blog.xyz/api/og"
// 				/>

// 				{/* <!-- Meta Tags Generated via https://www.opengraph.xyz --> */}
// 			</Head>
