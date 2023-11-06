import { ToolTipComponent } from "@components/ToolTipComponent";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { BookOpen } from "lucide-react";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import React from "react";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";
import EditorContextProvider from "./components/EditorContext";

async function WriteLayout({ children }: { children: React.ReactNode }) {
	const supabase = createServerComponentSupabaseClient({ headers, cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<EditorContextProvider>
			<ToolTipComponent
				tip="View all notes"
				className="absolute top-4 right-4 z-[100] text-gray-400 hover:text-gray-100 active:scale-95"
			>
				<Link
					href={
						session
							? `/profile/${session.user.id}`
							: `/profile/anon`
					}
				>
					<BookOpen />
				</Link>
			</ToolTipComponent>

			<BlogContextProvider>{children}</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
