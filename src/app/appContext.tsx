"use client";
import { User } from "@supabase/supabase-js";
import { createContext, useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export const UserContext = createContext<{
	user?: User | null;
}>({});

export default function AppContext({
	children,
}: {
	children: React.ReactNode;
}) {
	const [user, setUser] = useState<User | null>(supabase.auth.user());
	useEffect(() => {
		supabase.auth.onAuthStateChange((_, session) => {
			setUser(session?.user || null);
		});
	}, []);
	return (
		<UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
	);
}
