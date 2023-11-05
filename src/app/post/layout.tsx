import {
	LoggedInOptions,
	NotLoggedInOptions,
} from "@components/Navbar/Options";
import SideSheet from "@components/SideSheet";
import { Button } from "@components/ui/button";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import React from "react";

async function layout({ children }: { children: React.ReactNode }) {
	const supabase = createServerComponentSupabaseClient({ headers, cookies });
	const {
		data: { session },
	} = await supabase.auth.getSession();

	const loggedIn = !!session;
	return (
		<>
			<SideSheet loggedIn={loggedIn}>
				{loggedIn ? <LoggedInOptions /> : <NotLoggedInOptions />}
			</SideSheet>
			{children}
		</>
	);
}

export default layout;
