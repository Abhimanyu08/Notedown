import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import {
	FormEventHandler,
	MouseEventHandler,
	useEffect,
	useState,
} from "react";
import Layout from "../components/Layout";
import { getAllPostTitles } from "../../utils/getResources";
import { supabase } from "../../utils/supabaseClient";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_BUCKET_NAME,
} from "../../utils/constants";
import { useRouter } from "next/router";
import { Session, User } from "@supabase/supabase-js";

interface HomeProps {
	titles: string[];
}
const Home: NextPage<HomeProps> = () => {
	const router = useRouter();
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		setSession(supabase.auth.session());

		supabase.auth.onAuthStateChange((_, session) => {
			setSession(session);
		});
	}, []);

	useEffect(() => {
		if (session) {
			const name = session.user?.user_metadata.full_name;
			const avatar_url = session.user?.user_metadata.avatar_url;
			supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({ name, avatar_url })
				.match({ id: session.user?.id })
				.then((val) => console.log(val));
		}
	}, [session]);

	return (
		<Layout>
			<p
				className="absolute right-0"
				onClick={() => {
					session
						? router.push(`/profile/${session.user?.id}`)
						: router.push("/signin");
				}}
			>
				{session?.user ? "Profile" : "Log/Sign In"}
			</p>
		</Layout>
	);
};

export default Home;
