import ToastProvider from "@/contexts/ToastProvider";
import "@/styles/globals.css";
import "@/styles/xterm.css";
import ExpandedImageProvider from "@components/BlogPostComponents/ExpandedImageProvider";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Metadata } from "next";
import {
	Kalam,
	Noto_Serif,
	Nunito_Sans,
	Source_Code_Pro,
} from "next/font/google";
import { cookies, headers } from "next/headers";
import SupabaseProvider from "./appContext";

const blockquote = Kalam({
	subsets: ["latin"],
	variable: "--font-fancy",
	weight: ["400", "700", "300"],
});

const serif = Noto_Serif({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-serif",
	weight: ["400", "700"],
});
const mono = Source_Code_Pro({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-mono",
	weight: ["400", "700"],
});
const sans = Nunito_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-sans",
	style: ["normal", "italic"],
	weight: ["400", "700", "300"],
});

export const metadata: Metadata = {
	title: "Rce-blog",
	description:
		"Write posts/notes containing prose, executable code snippets, free hand drawings and images.",
	icons: {
		icon: "/icon.png",
	},
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
		siteName: "Rce-blog",
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
		<html
			lang="en"
			className={`dark ${serif.variable} ${sans.variable} ${mono.variable} ${blockquote.variable}`}
		>
			<body className="flex flex-col h-screen w-full bg-gray-200 dark:bg-black transition-colors duration-300">
				<SupabaseProvider session={session}>
					<ToastProvider>
						<ExpandedImageProvider>
							{children}
						</ExpandedImageProvider>
					</ToastProvider>
				</SupabaseProvider>
			</body>
		</html>
	);
}
