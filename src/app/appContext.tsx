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

	return (
		<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
	);
}
