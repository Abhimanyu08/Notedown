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
import { SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Blogger from "../interfaces/Blogger";
import Post from "../interfaces/Post";

export const UserContext = createContext<{
	user?: User | null;
	setUser?: Dispatch<SetStateAction<User | null>>;
}>({});

export const BlogContext = createContext<{
	blockToOutput?: Record<number, string>;
	setBlockToCode?: Dispatch<SetStateAction<Record<number, string>>>;
	collectCodeTillBlock?: (blockNumber: number) => void;
}>({});

export const TrialContext = createContext<{
	trialPosts?: Partial<Post>[] | null;
	setTrialPosts?: Dispatch<
		SetStateAction<Partial<Post>[] | undefined | null>
	>;
}>({});

function MyApp({ Component, pageProps }: AppProps) {
	const [user, setUser] = useState<User | null>(supabase.auth.user());
	const [updated, setUpdated] = useState(false);
	const [trialPosts, setTrialPosts] = useState<
		Partial<Post>[] | undefined | null
	>(null);

	useEffect(() => {
		if (user && !updated) {
			supabase
				.from<Blogger>(SUPABASE_BLOGGER_TABLE)
				.select("name, avatar_url")
				.eq("id", user.id)
				.then((val) => {
					const { name, avatar_url } = val.data!.at(0)!;
					if (!name) {
						console.log("name changed", user.user_metadata.name);
						supabase
							.from<Blogger>(SUPABASE_BLOGGER_TABLE)
							.update({ name: user.user_metadata.name })
							.match({ id: user.id })
							.then(() => null);
					}

					if (!avatar_url) {
						console.log(
							"avatar changed",
							user.user_metadata.avatar_url
						);
						supabase
							.from<Blogger>(SUPABASE_BLOGGER_TABLE)
							.update({
								avatar_url: user.user_metadata.avatar_url,
							})
							.match({ id: user.id })
							.then(() => null);
					}
				});
			setUpdated(true);
		}
	}, [user]);

	useEffect(() => {
		supabase.auth.onAuthStateChange((_, session) => {
			setUser(session?.user || null);
		});
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			<TrialContext.Provider value={{ trialPosts, setTrialPosts }}>
				<Component {...pageProps} />
			</TrialContext.Provider>
		</UserContext.Provider>
	);
}

export default MyApp;
