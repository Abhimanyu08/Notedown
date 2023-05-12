"use client";
import { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export const UserContext = createContext<{
	user?: User | null;
}>({});

export default function AppContext({
	children,
}: {
	children: React.ReactNode;
}) {
	const [supabase] = useState(() => createBrowserSupabaseClient());
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			supabase.auth
				.getUser()
				.then((userResp) => setUser(userResp.data.user));
			router.refresh();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [router, supabase]);

	// useEffect(() => {
	// 	supabase.auth.onAuthStateChange((event, session) => {
	// 		setUser(session?.user || null);
	// 		if (event === "SIGNED_OUT") {
	// 			// delete cookies on sign out
	// 			const expires = new Date(0).toUTCString();
	// 			document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
	// 			document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
	// 		} else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
	// 			const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
	// 			document.cookie = `sb-access-token=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
	// 			document.cookie = `sb-refresh-token=${session?.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
	// 		}
	// 	});
	// }, []);
	return (
		<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
	);
}
