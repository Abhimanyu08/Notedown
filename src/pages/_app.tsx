import { User } from "@supabase/supabase-js";
import { AppProps } from "next/app";
import {
	createContext,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import "../../styles/globals.css";
import { notifyServer } from "../../utils/handleAuth";
import { supabase } from "../../utils/supabaseClient";

export const UserContext = createContext<{
	user: User | null;
	setUser: Dispatch<SetStateAction<User | null>> | null;
}>({ user: null, setUser: null });

function MyApp({ Component, pageProps }: AppProps) {
	const [user, setUser] = useState<User | null>(supabase.auth.user());

	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			console.log(event);
			setUser(session?.user || null);
			notifyServer(event, session);
		});

		return () => data?.unsubscribe();
	});

	return (
		<UserContext.Provider value={{ user, setUser }}>
			<Component {...pageProps} />
		</UserContext.Provider>
	);
}

export default MyApp;
