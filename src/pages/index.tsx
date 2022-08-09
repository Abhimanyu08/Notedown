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
import { SUPABASE_BUCKET_NAME } from "../../utils/constants";
import { useRouter } from "next/router";
import { User } from "@supabase/supabase-js";

interface HomeProps {
	titles: string[];
}
const Home: NextPage<HomeProps> = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const auth = supabase.auth.user();
		if (auth) {
			setUser(auth);
		}
	}, [supabase.auth.user()]);

	return (
		<Layout>
			<p
				className="absolute right-0"
				onClick={() => {
					user
						? router.push(`/profile/${user.id}`)
						: router.push("/signin");
				}}
			>
				{user ? "Profile" : "Log/Sign In"}
			</p>
		</Layout>
	);
};

export default Home;
