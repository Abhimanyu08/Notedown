import { User } from "@supabase/supabase-js";
import "../../styles/xterm.css";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
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
import PostContextComponent from "../Contexts/PostContext";
import Blogger from "../interfaces/Blogger";
import { Analytics } from "@vercel/analytics/react";

export const UserContext = createContext<{
	user?: User | null;
	setUser?: Dispatch<SetStateAction<User | null>>;
}>({});

export const BlogContext = createContext<{
	containerId?: string;
	vimEnabled?: boolean;
	setVimEnabled?: Dispatch<SetStateAction<boolean>>;
	blockToOutput?: Record<number, string>;
	setBlockToCode?: Dispatch<SetStateAction<Record<number, string>>>;
	setBlockToOutput?: Dispatch<SetStateAction<Record<number, string>>>;
	collectCodeTillBlock?: (blockNumber: number) => void;
}>({});

export const CanvasImageContext = createContext<{
	canvasImages: Record<string, any | null>;
	setCanvasImages: Dispatch<SetStateAction<Record<string, any | null>>>;
}>({ canvasImages: {}, setCanvasImages: () => {} });

function MyApp({ Component, pageProps }: AppProps) {
	const [user, setUser] = useState<User | null>(supabase.auth.user());
	const [updated, setUpdated] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (user && !updated) {
			supabase
				.from<Blogger>(SUPABASE_BLOGGER_TABLE)
				.select("name")
				.eq("id", user.id)
				.then((val) => {
					const { name } = val.data!.at(0)!;
					if (!name) {
						supabase
							.from<Blogger>(SUPABASE_BLOGGER_TABLE)
							.update({ name: user.user_metadata.name })
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
			<PostContextComponent>
				<Component {...pageProps} key={router.asPath} />
				{process.env.NODE_ENV === "production" ? <Analytics /> : <></>}
			</PostContextComponent>
		</UserContext.Provider>
	);
}

export default MyApp;
