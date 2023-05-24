"use client";
// import { User } from "@supabase/supabase-js";
// import { createContext, useEffect, useState } from "react";
// import { supabase } from "@/utils/supabaseClient";
// import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
// import { useRouter } from "next/navigation";

// export const UserContext = createContext<{
// 	user?: User | null;
// }>({});

// export default function AppContext({
// 	children,
// }: {
// 	children: React.ReactNode;
// }) {
// 	const [supabase] = useState(() => createBrowserSupabaseClient());
// 	const [user, setUser] = useState<User | null>(null);
// 	const router = useRouter();
// 	useEffect(() => {
// 		const {
// 			data: { subscription },
// 		} = supabase.auth.onAuthStateChange(() => {
// 			supabase.auth
// 				.getUser()
// 				.then((userResp) => setUser(userResp.data.user));
// 			router.refresh();
// 		});

// 		return () => {
// 			subscription.unsubscribe();
// 		};
// 	}, [router, supabase]);

// 	return (
// 		<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
// 	);
// }

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
	Session,
	createBrowserSupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

import type { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/interfaces/supabase";

type MaybeSession = Session | null;

type SupabaseContext = {
	supabase: SupabaseClient<Database>;
	session: MaybeSession;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
	children,
	session,
}: {
	children: React.ReactNode;
	session: MaybeSession;
}) {
	const [supabase] = useState(() => createBrowserSupabaseClient());
	const router = useRouter();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			router.refresh();
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [router, supabase]);

	return (
		<Context.Provider value={{ supabase, session }}>
			<>{children}</>
		</Context.Provider>
	);
}

export const useSupabase = () => {
	const context = useContext(Context);

	if (context === undefined) {
		throw new Error("useSupabase must be used inside SupabaseProvider");
	}

	return context;
};
