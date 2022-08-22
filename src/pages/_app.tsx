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

export const BlogContext = createContext<{
	blockToOutput?: Record<number, string>;
	setBlockToCode?: Dispatch<SetStateAction<Record<number, string>>>;
	collectCodeTillBlock?: (blockNumber: number) => void;
}>({});

function MyApp({ Component, pageProps }: AppProps) {
	const [user, setUser] = useState<User | null>(supabase.auth.user());

	useEffect(() => {
		notifyServer("SIGNED_IN", supabase.auth.session());
	}, []);
	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event, session) => {
			console.log(event);
			setUser(session?.user || null);
			notifyServer(event, session);
		});

		return () => data?.unsubscribe();
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			<Component {...pageProps} />
		</UserContext.Provider>
	);
}

export default MyApp;
