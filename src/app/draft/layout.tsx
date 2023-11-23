import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import SideSheet from "@components/SideSheet";
import { ToolTipComponent } from "@components/ToolTipComponent";
import { Button } from "@components/ui/button";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { BookOpen } from "lucide-react";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import React from "react";

async function DraftLayout({ children }: { children: React.ReactNode }) {
	const supabase = createSupabaseServerClient(cookies);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<BlogContextProvider>
			<ToolTipComponent
				tip="View all notes"
				className="absolute top-6 right-8 z-[100] text-gray-400 hover:text-gray-100 active:scale-95"
			>
				<Link
					href={
						session
							? `/notebook/${session.user.id}`
							: `/notebook/anon`
					}
				>
					<BookOpen />
				</Link>
			</ToolTipComponent>
			{children}
		</BlogContextProvider>
	);
}

export default DraftLayout;
