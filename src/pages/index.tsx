import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { LIMIT, SUPABASE_POST_TABLE } from "../../utils/constants";
import { fetchUpvotes } from "../../utils/fetchUpvotes";
import { supabase } from "../../utils/supabaseClient";
import Layout from "../components/Layout";
import PostDisplay from "../components/PostDisplay";
import SearchComponent from "../components/SearchComponent";
import Post from "../interfaces/Post";
import PostWithBlogger from "../interfaces/PostWithBlogger";
import { UserContext } from "./_app";

interface HomeProps {
	posts: PostWithBlogger[] | null;
}
const Home: NextPage<HomeProps> = ({ posts }) => {
	const router = useRouter();
	const { user } = useContext(UserContext);
	const [homePosts, setHomePosts] = useState<
		Partial<PostWithBlogger>[] | null | undefined
	>(posts);
	const [searchResults, setSearchResults] = useState<
		PostWithBlogger[] | Post[]
	>();
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchUpvotes(homePosts, setHomePosts);
	}, []);

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
		console.log("This triggered", searchTerm);
		if (!searchTerm) return;
		if (!cursor) {
			const { data, error } = await supabase
				.from<PostWithBlogger>(SUPABASE_POST_TABLE)
				.select("*, bloggers(name)")
				.textSearch("search_index_col", searchTerm)
				.order("upvote_count", { ascending: false })
				.limit(LIMIT);
			console.log(data);
			if (error || !data) return false;

			setSearchResults(data);
			return data.length > 0;
		}
		if (cursor) {
			const { data, error } = await supabase
				.from<PostWithBlogger>(SUPABASE_POST_TABLE)
				.select("*,bloggers(name)")
				.textSearch("search_index_col", searchTerm)
				.lt("upvote_count", cursor)
				.order("upvote_count", { ascending: false })
				.limit(LIMIT);

			if (error || !data) {
				console.log(error.message || "data returned is null");
				return false;
			}
			setSearchResults((prev) => [...(prev || []), ...data]);
			return data.length > 0;
		}
	};
	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				<title>Rce Blog</title>
				<meta
					name="description"
					content="Home page of the rce-blog.xyz website"
				/>
				<meta
					name="keywords"
					content="Rce Blog, remote code execution, blog, tech blog"
				/>
				<meta
					property="og:title"
					content="Home Page of the Rce Blog website"
				/>
				<meta property="og:url" content="https://rce-blog.xyz" />
				<meta property="og:site_name" content="Rce Blog" />
				<meta property="og:type" content="website" />
			</Head>
			<div className="w-4/5 md:w-1/3 mx-auto">
				<SearchComponent
					fetchPosts={fetchSearchPosts}
					setPosts={setSearchResults}
					setSearchQuery={setSearchQuery}
				/>
			</div>
			<div className="px-4 md:px-32 xl:px-64 grow mt-5 overflow-hidden">
				{(searchResults?.length || 0) > 0 ? (
					<PostDisplay
						posts={searchResults || []}
						cursorKey="upvote_count"
						searchTerm={searchQuery}
						owner={false}
						fetchPosts={fetchSearchPosts}
					/>
				) : (
					<PostDisplay
						posts={homePosts || []}
						cursorKey="published_on"
						searchTerm={searchQuery}
						owner={false}
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
