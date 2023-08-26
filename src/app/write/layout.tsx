import React from "react";
import BlogContextProvider from "../../components/BlogPostComponents/BlogState";
import EditorContextProvider from "./components/EditorContext";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import Link from "next/link";

async function WriteLayout({ children }: { children: React.ReactNode }) {
	const supabase = createServerComponentSupabaseClient({ headers, cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<EditorContextProvider>
			<SideSheet>
				<Link
					href={
						session
							? `/profile/${session.user.id}`
							: `/profile/anon`
					}
				>
					<Button>View all notes</Button>
				</Link>
			</SideSheet>

			<BlogContextProvider>{children}</BlogContextProvider>
		</EditorContextProvider>
	);
}

export default WriteLayout;
