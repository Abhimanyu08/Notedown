import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import {
	LIMIT,
	SEARCH_PUBLC,
	SUPABASE_POST_TABLE,
} from "../../utils/constants";
import { fetchUpvotes } from "../../utils/fetchUpvotes";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import PostDisplay from "../components/PostDisplay";
import SearchComponent from "../components/SearchComponent";
import { PostContext } from "../Contexts/PostContext";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import SearchResults from "../interfaces/SearchResult";
import { UserContext } from "./_app";

interface HomeProps {
	posts: PostWithBlogger[] | null;
}
const Home: NextPage<HomeProps> = ({ posts }) => {
	const router = useRouter();
	const { user } = useContext(UserContext);

	const [searchResults, setSearchResults] = useState<SearchResults[]>();
	const [searchQuery, setSearchQuery] = useState("");
	const [fetchedUpvote, setFetchedUpvote] = useState(false);

	const { homePosts, setHomePosts } = useContext(PostContext);

	useEffect(() => {
		if (homePosts.length === 0) setHomePosts(posts || []);
	}, []);

	useEffect(() => {
		if (
			!fetchedUpvote &&
			0 < homePosts.length &&
			homePosts.length <= LIMIT
		) {
			fetchUpvotes(homePosts, setHomePosts);
			setFetchedUpvote(true);
		}
	}, [homePosts]);

	const fetchHomePosts = async ({ cursor }: { cursor: string | number }) => {
		const { data, error } = await supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select("*,bloggers(name)")
			.match({ published: true })
			.lt("published_on", cursor)
			.order("published_on", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return false;
		}
		setHomePosts((prev) => [...(prev || []), ...data]);
		return data.length > 0;
	};

	const fetchSearchPosts = async ({
		cursor,
		searchTerm,
	}: {
		cursor?: string | number;
		searchTerm?: string;
	}) => {
		if (!searchTerm) return;

		const { data, error } = await supabase.rpc<SearchResults>(
			SEARCH_PUBLC,
			{
				search_term: searchTerm,
				cursor: cursor || null,
			}
		);

		if (error || !data) return false;

		setSearchResults(data);
		return data.length > 0;
	};
	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				<title>Read - RCE-Blog</title>
				<meta
					name="description"
					content="Write notes containing prose, executable code snippets, free hand drawings and images."
				/>
				<meta
					name="keywords"
					content="RCE-Blog, remote code execution, blog, tech blog"
				/>
				<meta
					property="og:title"
					content="Read Page of the RCE-Blog website"
				/>
				<meta property="og:url" content="https://rce-blog.xyz/read" />
				<meta property="og:site_name" content="RCE-Blog" />
				<meta property="og:type" content="website" />
			</Head>
			<div className=" w-full px-5 lg:px-0 md:w-3/5 lg:w-1/3 mx-auto">
				<SearchComponent
					fetchPosts={fetchSearchPosts}
					setPosts={setSearchResults}
					setSearchQuery={setSearchQuery}
				/>
			</div>
			<div className="lg:w-3/5 w-full  self-center grow mt-12 overflow-hidden">
				{(searchResults?.length || 0) > 0 ? (
					<PostDisplay
						key={"search_results"}
						posts={searchResults || []}
						cursorKey="search_rank"
						searchTerm={searchQuery}
						fetchPosts={fetchSearchPosts}
					/>
				) : (
					<PostDisplay
						key={"latest_posts"}
						posts={homePosts || []}
						cursorKey="published_on"
						searchTerm={searchQuery}
						fetchPosts={fetchHomePosts}
					/>
				)}
			</div>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps<HomeProps> = async ({}) => {
	const { data } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(
			`id,created_by,title,description,language,published,published_on,bloggers(name)`
		)
		.match({ published: true })
		.order("published_on", { ascending: false })
		.limit(LIMIT);

	return {
		props: {
			posts: data,
		},
	};
};

export default Home;
