import { ApiError, Session, User } from "@supabase/supabase-js";
import type { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SUPABASE_BLOGGER_TABLE } from "../../utils/constants";
import handleSignIn from "../../utils/handleSignIn";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import useAuth from "../hooks/useAuth";

interface HomeProps {
	loggedInUser: User | null;
	error: ApiError | null;
}
const Home: NextPage<HomeProps> = ({ loggedInUser, error }) => {
	loggedInUser = useAuth(loggedInUser || null);
	const router = useRouter();
	useEffect(() => {
		if (error) {
			console.log(error);
			return;
		}

		if (loggedInUser) {
			const name = loggedInUser.user_metadata.full_name;
			const avatar_url = loggedInUser.user_metadata.avatar_url;
			supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({ name, avatar_url })
				.match({ id: loggedInUser.id });
		}
	}, [loggedInUser]);

	return (
		<Layout user={loggedInUser} route={router.asPath}>
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
