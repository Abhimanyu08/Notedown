import { ApiError, User } from "@supabase/supabase-js";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";

interface HomeProps {
	loggedInUser: User | null;
	error: ApiError | null;
}
const Home: NextPage<HomeProps> = ({ loggedInUser, error }) => {
	const { user, setUser } = useAuth(loggedInUser || null);
	const router = useRouter();
	useEffect(() => {
		if (error) {
			console.log(error);
			return;
		}

		if (user) {
			const name = user.user_metadata.full_name;
			const avatar_url = user.user_metadata.avatar_url;
			supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({ name, avatar_url })
				.match({ id: user.id });
		}
	}, [user]);

	return (
		<Layout
			user={user}
			route={router.asPath}
			logoutCallback={() => setUser(null)}
		>
			<></>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	let { user, error } = await supabase.auth.api.getUserByCookie(req);

	return {
		props: {
			loggedInUser: user,
			error: error?.message || null,
		},
	};
};
export default Home;
