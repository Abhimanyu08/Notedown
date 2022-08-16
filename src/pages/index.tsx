import { User } from "@supabase/supabase-js";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import PostComponent from "../components/PostComponent";
import Post from "../interfaces/Post";
import { UserContext } from "./_app";

interface PostWithAuthor extends Post {
	bloggers: { name: string };
}

interface HomeProps {
	loggedInUser: User | null;
	posts: PostWithAuthor[] | null;
}
const Home: NextPage<HomeProps> = ({ loggedInUser, posts }) => {
	const router = useRouter();
	const { user: contextUser } = useContext(UserContext);
	const [user, setUser] = useState(loggedInUser);

	useEffect(() => {
		if (contextUser) {
			setUser(contextUser);
		}
		if (!loggedInUser && !contextUser) {
			setUser(null);
		}
		if (user) {
			const name = user.user_metadata.full_name;
			const avatar_url = user.user_metadata.avatar_url;
			supabase
				.from(SUPABASE_BLOGGER_TABLE)
				.update({ name, avatar_url })
				.match({ id: user.id });
		}
	}, [loggedInUser, contextUser]);

	return (
		<Layout user={user} route={router.asPath} logoutCallback={() => null}>
			<div className="flex flex-col gap-6 mx-2">
				{posts &&
					posts.map((post) => (
						<PostComponent
							key={post.id!}
							description={post.description!}
							name={post.title!}
							postId={post.id!}
							postedOn={post.created_at!}
							authorId={post.created_by!}
							author={post?.bloggers?.name || ""}
							owner={false}
						/>
					))}
			</div>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({
	req,
}) => {
	let { user, error } = await supabase.auth.api.getUserByCookie(req);

	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(`*, bloggers(name)`);
	return {
		props: {
			loggedInUser: user,
			error: error?.message || null,
			posts: data,
		},
	};
};

// export const getServerSideProps = withPageAuth({
// 	authRequired: false,
// 	async getServerSideProps(ctx) {
// 		// Access the user object
// 		const { user, accessToken, error } = await getUser(ctx);
// 		const { data } = await supabaseServerClient(ctx)
// 			.from(SUPABASE_POST_TABLE)
// 			.select(`*, bloggers(name)`);
// 		return { props: { posts: data } };
// 	},
// });
export default Home;
