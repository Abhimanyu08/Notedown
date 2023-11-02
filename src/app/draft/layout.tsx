import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import React from "react";

async function DraftLayout({ children }: { children: React.ReactNode }) {
	const supabase = createServerComponentSupabaseClient({ headers, cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<BlogContextProvider>
			<SideSheet loggedIn={!!session}>
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
			{children}
		</BlogContextProvider>
	);
}

export default DraftLayout;
