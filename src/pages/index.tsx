import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { SUPABASE_POST_TABLE, LIMIT } from "../../utils/constants";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import PostComponent from "../components/PostComponent";
import PostDisplay from "../components/PostDisplay";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import { checkPostsType } from "../../utils/checkPostsType";
import { UserContext } from "./_app";
import SearchComponent from "../components/SearchComponent";
import Post from "../interfaces/Post";

interface HomeProps {
	posts: PostWithBlogger[] | null;
}
const Home: NextPage<HomeProps> = ({ posts }) => {
	const router = useRouter();
	const { user } = useContext(UserContext);
	const [homePosts, setHomePosts] = useState(posts);
	const [searchResults, setSearchResults] = useState<
		PostWithBlogger[] | Post[]
	>();

	return (
		<Layout user={user || null} route={router.asPath}>
			<div className="w-1/3 mx-auto">
				<SearchComponent setPosts={setSearchResults} />
			</div>
			<div className="px-80 grow-1 min-h-0 overflow-y-auto">
				{(searchResults?.length || 0) > 0 ? (
					<PostDisplay posts={searchResults} />
				) : (
					<PostDisplay
						posts={homePosts}
						ascending={false}
						cursorKey={"published_on"}
						owner={false}
						addPosts={(newPosts) => {
							if (!newPosts || !checkPostsType(newPosts)) return;
							setHomePosts((prev) => [
								...(prev || []),
								...newPosts,
							]);
						}}
					/>
				)}
			</div>
		</Layout>
	);
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async ({}) => {
	const { data } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(`*, bloggers(name)`)
		.order("published_on", { ascending: false })
		.limit(LIMIT);
	return {
		props: {
			posts: data,
		},
	};
};

export default Home;
