import "@/styles/globals.css";
import "@/styles/xterm.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import { Petrona, Nunito_Sans, IBM_Plex_Mono } from "next/font/google";
import { cookies } from "next/headers";
import SupabaseProvider from "./appContext";
import IndexedDbContextProvider from "@/contexts/IndexedDbContext";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@components/ui/toaster";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";

const serif = Petrona({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-serif",
	style: ["normal", "italic"],
	weight: ["400", "700", "600"],
});
const mono = IBM_Plex_Mono({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-mono",
	weight: ["400", "700", "500"],
});
const sans = Nunito_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-sans",
	style: ["normal", "italic"],
	weight: ["400", "700", "300"],
});

export const metadata: Metadata = {
	title: "Notedown",
	description: "Embed computation and tldraw canvas in your markdown notes",
	icons: {
		icon: "/icon.png",
	},
	twitter: {
		title: "Notedown",
		description:
			"Embed computation and tldraw canvas in your markdown notes",
		card: "summary",
		site: "https://notedown.art",
	},
	openGraph: {
		url: "https://notedown.art",
		type: "website",
		title: "Notedown",
		siteName: "Notedown",
		description:
			"Embed computation and tldraw canvas in your markdown notes",
	},
};

export default async function RootLayout({
	// Layouts must accept a children prop.
	// This will be populated with nested layouts or pages
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = createSupabaseServerClient(cookies);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<html
			lang="en"
			className={`dark ${serif.variable} ${sans.variable} ${mono.variable}`}
		>
			<body className="flex flex-col h-screen w-full bg-gray-200 dark:bg-black ">
				<Toaster />
				<SupabaseProvider session={session}>
					<IndexedDbContextProvider>
						{children}
					</IndexedDbContextProvider>
				</SupabaseProvider>
				<SpeedInsights />
				<Analytics />
			</body>
		</html>
	);
}
