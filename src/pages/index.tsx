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
	posts: PostWithAuthor[] | null;
}
const Home: NextPage<HomeProps> = ({ posts }) => {
	const router = useRouter();
	const { user } = useContext(UserContext);

	return (
		<Layout user={user || null} route={router.asPath}>
			<div className="flex flex-col gap-6 px-80 grow-1 min-h-0">
				{posts &&
					posts.map((post) => {
						if (!post.published) return <></>;
						return (
							<PostComponent
								key={post.id!}
								description={post.description!}
								title={post.title!}
								postId={post.id!}
								publishedOn={post.published_on}
								authorId={post.created_by!}
								author={post?.bloggers?.name || ""}
								published={post.published}
								owner={false}
							/>
						);
					})}
			</div>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({}) => {
	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(`*, bloggers(name)`);
	return {
		props: {
			posts: data,
		},
	};
};

export default Home;
