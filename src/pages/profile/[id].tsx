import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { SetStateAction, useContext, useEffect, useState } from "react";
import {
	LIMIT,
	SEARCH_PRIVATE,
	SEARCH_UPVOTED_POSTS_FUNCTION,
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
	SUPABASE_UPVOTES_TABLE,
} from "../../../utils/constants";
import { fetchUpvotes } from "../../../utils/fetchUpvotes";
import mdToHtml from "../../../utils/mdToHtml";
import checkGreatestStillGreatest from "../../../utils/checkGreatestStillGreatest";

import { supabase } from "../../../utils/supabaseClient";
import { About } from "../../components/ProfilePageComponents/About";
import { DeleteModal } from "../../components/Modals/DeleteModal";
import Layout from "../../components/Layout";
import PostDisplay from "../../components/PostDisplay";
import { PublishModal } from "../../components/Modals/PublishModal";
import SearchComponent from "../../components/SearchComponent";
import { UnPublishModal } from "../../components/Modals/UnPublishModal";
import { UploadModal } from "../../components/Modals/UploadModal";
import UserDisplay from "../../components/ProfilePageComponents/UserDisplay";
import Blogger from "../../interfaces/Blogger";
import Post from "../../interfaces/Post";
import PostWithBlogger from "../../interfaces/PostWithBlogger";
import SearchResult from "../../interfaces/SearchResult";
import Upvotes from "../../interfaces/Upvotes";
import { UserContext } from "../_app";
import { ProfileUser } from "../../interfaces/ProfileUser";
import { PostTypeSelecter } from "../../components/ProfilePageComponents/PostTypeSelecter";
import { SectionSelector } from "../../components/ProfilePageComponents/SectionSelector";
import { PostContext } from "../../Contexts/PostContext";
import { sendRevalidationRequest } from "../../../utils/sendRequest";

interface ProfileProps {
	latest?: Partial<PostWithBlogger>[];
	greatest?: Partial<PostWithBlogger>[];
	profileUser?: ProfileUser;
}

interface UpvotedPost extends Post {
	upvoted_on: string;
}

export type PostType = "latest" | "greatest" | "private" | "upvoted";
export type SectionType = "posts" | "about";

function Profile({ profileUser, latest, greatest }: ProfileProps) {
	const { user } = useContext(UserContext);
	const router = useRouter();

	let id =
		(router?.query?.id as string | undefined) || profileUser?.id || null;
	const [profile, setProfile] = useState(profileUser);
	const [section, setSection] = useState<SectionType>("about");
	const [postType, setPostType] = useState<PostType>("latest");

	const [searchResults, setSearchResults] = useState<SearchResult[]>();

	const [upvotedPosts, setUpvotedPosts] = useState<Partial<UpvotedPost>[]>(
		[]
	);
	const [upvotedSearchPosts, setUpvotedSearchPosts] =
		useState<Partial<Post>[]>();

	const [searchQuery, setSearchQuery] = useState("");
	const [postInAction, setPostInAction] = useState<Partial<Post> | null>(
		null
	);
	const {
		homePosts,
		setHomePosts,
		latestPosts: ownersLatestPosts,
		setLatestPosts: setOwnerLatestPosts,
		greatestPosts: ownerGreatestPosts,
		setGreatestPosts: setOwnerGreatestPosts,
		privatePosts: ownerPrivatePosts,
		setPrivatePosts: setOwnerPrivatePosts,
	} = useContext(PostContext);

	const [latestPosts, setLatestPosts] = useState<Partial<Post>[]>(() => {
		if (id === user?.id && ownersLatestPosts.length > 0)
			return ownersLatestPosts;
		return latest || [];
	});
	const [privatePosts, setPrivatePosts] = useState<
		Partial<PostWithBlogger>[]
	>(() => {
		if (id === user?.id && ownerPrivatePosts.length > 0)
			return ownerPrivatePosts;
		return [];
	});
	const [greatestPosts, setGreatestPosts] = useState<
		Partial<PostWithBlogger>[]
	>(() => {
		if (id === user?.id && ownerGreatestPosts.length > 0)
			return ownerGreatestPosts;
		return greatest || [];
	});

	useEffect(() => {
		if (user?.id === id) {
			setOwnerLatestPosts(latestPosts);
			setOwnerGreatestPosts(greatestPosts);
			setOwnerPrivatePosts(privatePosts);
		}
	}, [latestPosts, greatestPosts, privatePosts]);

	useEffect(() => {
		if (!id) return;
		checkGreatestStillGreatest(id as string, greatest);
		fetchUpvotes(latestPosts, setLatestPosts);
		fetchUpvotes(greatestPosts, setGreatestPosts);
	}, []);

	useEffect(() => {
		if (privatePosts.length === 0) {
			supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select()
				.match({ created_by: profile?.id, published: false })
				.order("created_at", { ascending: false })
				.limit(LIMIT)
				.then((val) => {
					if (!val.data || val.data.length === 0) {
						return;
					}
					let modifiedPosts = val.data.map((p) => ({
						...p,
						bloggers: { name: profileUser!.name },
					}));
					setPrivatePosts(modifiedPosts);
				});
		}

		if (postType === "upvoted") {
			if (upvotedPosts.length > 0) return;
			fetchUpvotedPosts({});
		}
	}, [postType]);

	const fetchUpvotedPosts = async ({
		cursor,
	}: {
		cursor?: string | number;
	}) => {
		if (cursor) {
			const { data } = await supabase
				.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
				.select("created_at, post_id")
				.match({ upvoter: profile?.id })
				.lt("created_at", cursor)
				.order("created_at", { ascending: false })
				.limit(LIMIT);
			if (data) {
				const { data: posts } = await supabase
					.from<Post>(SUPABASE_POST_TABLE)
					.select(
						"id,created_by,title,description,language,published,published_on,upvote_count,bloggers(name)"
					)
					.in(
						"id",
						data.map((upvote) => upvote.post_id)
					);
				if (posts) {
					let modifiedData: Record<number, string> = {};
					data.forEach(
						(upvote) =>
							(modifiedData[upvote.post_id] = upvote.created_at)
					);
					let upvotedPosts = posts
						.map((post) => ({
							...post,
							upvoted_on: modifiedData[post.id],
						}))
						.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
					setUpvotedPosts((prev) => [
						...(prev || []),
						...upvotedPosts,
					]);
				}
			}
			return (data?.length || 0) > 0;
		}

		const { data } = await supabase
			.from<Upvotes>(SUPABASE_UPVOTES_TABLE)
			.select("created_at, post_id")
			.match({ upvoter: profile?.id })
			.order("created_at", { ascending: false })
			.limit(LIMIT);

		if (data) {
			const { data: posts } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select(
					"id,created_by,title,description,language,published,published_on,upvote_count,bloggers(name)"
				)
				.in(
					"id",
					data.map((upvote) => upvote.post_id)
				);

			if (posts) {
				let modifiedData: Record<number, string> = {};
				data.forEach(
					(upvote) =>
						(modifiedData[upvote.post_id] = upvote.created_at)
				);

				let upvotedPosts = posts
					.map((post) => ({
						...post,
						upvoted_on: modifiedData[post.id],
					}))
					.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
				setUpvotedPosts((prev) => [...(prev || []), ...upvotedPosts]);
			}
		}
		return (data?.length || 0) > 0;
	};

	const fetchPrivatePosts = async ({
		cursor,
	}: {
		cursor: string | number;
	}) => {
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileUser?.id, published: false })
			.lt("created_at", cursor)
			.order("created_at", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return false;
		}
		setPrivatePosts((prev) => [...(prev || []), ...data]);
		return data.length > 0;
	};

	const fetchGreatestPosts = async ({
		cursor,
	}: {
		cursor?: string | number;
	}) => {
		if (!cursor) return;
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileUser?.id, published: true })
			.lt("upvote_count", cursor)
			.order("upvote_count", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return false;
		}
		setGreatestPosts((prev) => [...(prev || []), ...data]);
		return data.length > 0;
	};

	const fetchLatestPosts = async ({
		cursor,
	}: {
		cursor?: string | number;
	}) => {
		if (!cursor) return;
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileUser?.id, published: true })
			.lt("published_on", cursor)
			.order("published_on", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return false;
		}
		if (setLatestPosts)
			setLatestPosts((prev) => [...(prev || []), ...data]);
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
		const { data, error } = await supabase.rpc<SearchResult>(
			SEARCH_PRIVATE,
			{
				user_id: profile?.id,
				search_term: searchTerm,
				cursor: cursor || null,
			}
		);

		if (error || !data) return;
		setSearchResults(data);
		return data.length > 0;
	};

	const fetchSearchUpvotes = async ({
		cursor,
		searchTerm,
	}: {
		cursor?: string | number;
		searchTerm?: string;
	}) => {
		if (!searchTerm) return;

		const { data } = await supabase.rpc<SearchResult>(
			SEARCH_UPVOTED_POSTS_FUNCTION,
			{
				user_id: profile?.id,
				search_term: searchTerm,
				cursor: cursor || null,
			}
		);
		if (data) {
			setUpvotedSearchPosts(data);
		}
		return (data?.length || 0) > 0;
	};

	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				<title>{`${profileUser?.name}`}</title>
				<meta name="author" content={profileUser?.name || ""} />
				<meta
					name="description"
					content={`RCE-Blog profile page of ${profileUser?.name}`}
				/>
				<meta
					property="og:title"
					content={`${profileUser?.name} - RCE Blog`}
				/>
				<meta
					property="og:description"
					content={`${profileUser?.about?.slice(0, 20) || ""}...`}
				/>
				<meta
					property="og:image"
					content={`${profile?.avatar_url || ""}`}
				/>
				<meta
					property="og:url"
					content={`https://rce-blog.xyz/profile/${profileUser?.id}`}
				/>
				<meta property="og:site_name" content="RCE-Blog" />
				<meta property="og:type" content="website" />

				<meta name="twitter:card" content="summary_large_image" />
				<meta property="twitter:domain" content="rce-blog.xyz" />
				<meta
					property="twitter:url"
					content={`https://rce-blog.xyz/profile/${profileUser?.id}`}
				/>
				<meta name="twitter:title" content={profileUser?.name} />
				<meta
					name="twitter:description"
					content={`RCE-Blog Profile page of ${profileUser?.name}`}
				/>
				<meta
					name="twitter:image"
					content={`${profileUser?.avatar_url}`}
				/>
			</Head>
			<>
				{user?.id === id && (
					<UploadModal
						userId={user!.id}
						afterUploadCallback={(newPost: Post) => {
							setPrivatePosts((prev) => [newPost, ...prev]);
						}}
					/>
				)}

				{postInAction && (
					<>
						<DeleteModal
							post={postInAction}
							afterActionCallback={(post) => {
								const stateChangeFunc = (
									prev: Partial<PostWithBlogger>[]
								) => prev.filter((p) => p.id !== post.id);
								if (
									postType === "latest" ||
									postType === "greatest"
								) {
									setLatestPosts(stateChangeFunc);
									setGreatestPosts(stateChangeFunc);
									sendRevalidationRequest(
										`/posts/${post.id}`
									);
									sendRevalidationRequest(`/profile/${id}`);

									if (
										homePosts.some((p) => p.id === post.id)
									) {
										setHomePosts(stateChangeFunc);
										sendRevalidationRequest(`/read`);
									}
								}
								if (postType === "private") {
									setPrivatePosts(stateChangeFunc);
								}
							}}
						/>
						<PublishModal
							post={postInAction}
							afterActionCallback={(post) => {
								setPrivatePosts((prev) =>
									prev.filter((p) => p.id !== post.id)
								);

								setLatestPosts((prev) => [post, ...prev]);
								setHomePosts((prev) => [post, ...prev]);

								sendRevalidationRequest(`/posts/${post.id}`);
								sendRevalidationRequest(`/profile/${id}`);
								sendRevalidationRequest(`/read`);
							}}
						/>
						<UnPublishModal
							post={postInAction}
							afterActionCallback={(post) => {
								setLatestPosts((prev) =>
									prev.filter((p) => p.id !== post.id)
								);
								setGreatestPosts((prev) =>
									prev.filter((p) => p.id !== post.id)
								);

								setPrivatePosts((prev) => [post, ...prev]);
								if (homePosts.some((p) => p.id === post.id)) {
									setHomePosts((prev) =>
										prev.filter((p) => p.id !== post.id)
									);
									sendRevalidationRequest(`/read`);
								}
							}}
						/>
					</>
				)}
			</>
			<div
				className="lg:grid flex flex-col grow lg:min-h-0 h-max overflow-y-auto lg:overflow-y-clip lg:grid-cols-7 text-white gap-y-10  xl:px-64 px-3
			md:px-5 lg:px-32"
			>
				<div className={` lg:col-span-2 h-fit lg:h-full`}>
					<UserDisplay profile={profile!} user={user || null} />
				</div>
				<div className="lg:col-span-5 flex flex-col  lg:min-h-0 grow overflow-x-hidden md:pr-2 md:overflow-y-clip">
					<div className="flex justify-start grow-0 items-center  md:pb-4 lg:pb-0 border-black">
						<SectionSelector {...{ section, setSection }} />
					</div>

					<div
						className={` flex flex-row w-[200%] ${
							section === "about" ? "" : "-translate-x-1/2"
						} transition-all duration-500 min-h-0 grow`}
					>
						<div
							className={`h-full mb-10 w-1/2 ${
								section === "about" ? "" : "invisible"
							}`}
						>
							<About
								userId={id || ""}
								owner={user?.id === id}
								originalAboutInMd={profile?.about || ""}
								originalAboutInHtml={profile?.htmlAbout || ""}
								setProfile={setProfile}
							/>
						</div>
						<div
							className={`w-1/2 flex flex-col overflow-visible h-full ${
								section === "posts" ? "" : "invisible"
							}`}
						>
							<div
								className={`grow-0 flex flex-col gap-2 md:gap-4 py-2 md:py-4`}
							>
								<div className="flex w-full justify-between">
									<PostTypeSelecter
										owner={user?.id === id}
										{...{ postType, setPostType }}
									/>
									{user?.id === id && (
										<label
											className="btn btn-sm text-white capitalize"
											htmlFor="upload"
										>
											New Post
										</label>
									)}
								</div>
								<div className="md:w-1/2">
									{postType === "upvoted" ? (
										<SearchComponent
											placeholder={
												user?.id === profile?.id
													? "Search posts upvoted by you"
													: `Search posts upvoted by ${profile?.name}`
											}
											fetchPosts={fetchSearchUpvotes}
											setPosts={setUpvotedSearchPosts}
											setSearchQuery={setSearchQuery}
										/>
									) : (
										<SearchComponent
											placeholder={
												user?.id === profile?.id
													? "Search your posts"
													: `Search ${profile?.name}'s posts`
											}
											fetchPosts={fetchSearchPosts}
											setPosts={setSearchResults}
											setSearchQuery={setSearchQuery}
										/>
									)}
								</div>
							</div>
							{searchQuery !== "" ? (
								<>
									{postType === "upvoted" ? (
										<PostDisplay
											posts={upvotedSearchPosts || []}
											cursorKey="search_rank"
											searchTerm={searchQuery}
											fetchPosts={fetchSearchUpvotes}
										/>
									) : (
										<PostDisplay
											posts={searchResults || []}
											cursorKey="search_rank"
											searchTerm={searchQuery}
											fetchPosts={fetchSearchPosts}
											setPostInAction={setPostInAction}
										/>
									)}
								</>
							) : (
								<>
									{postType === "latest" && (
										<PostDisplay
											posts={latestPosts || []}
											setPostInAction={setPostInAction}
											cursorKey={"published_on"}
											fetchPosts={fetchLatestPosts}
										/>
									)}
									{postType === "greatest" && (
										<PostDisplay
											posts={greatestPosts || []}
											setPostInAction={setPostInAction}
											cursorKey={"upvote_count"}
											fetchPosts={fetchGreatestPosts}
										/>
									)}
									{postType === "private" && (
										<PostDisplay
											posts={privatePosts || []}
											setPostInAction={setPostInAction}
											cursorKey={"created_at"}
											fetchPosts={fetchPrivatePosts}
										/>
									)}
									{postType === "upvoted" && (
										<PostDisplay
											posts={upvotedPosts || []}
											cursorKey={"upvoted_on"}
											fetchPosts={fetchUpvotedPosts}
										/>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return { paths: [], fallback: true };
};
export const getStaticProps: GetStaticProps<
	Partial<ProfileProps>,
	{ id: string }
> = async (context) => {
	if (!context.params) return { props: {}, redirect: "/" };
	const { id } = context.params;

	let userData: ProfileUser | undefined;
	let latest: Partial<Post>[] | undefined;
	let greatest: Partial<Post>[] | undefined;

	let error;

	await Promise.all([
		supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.select("id,name,avatar_url,about,twitter,github,web")
			.eq("id", id)
			.then((val) => {
				userData = val.data?.at(0);
				error = val.error;
			}),

		supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select(
				"id,published,published_on,title,description,language,bloggers(name),created_by"
			)
			.eq("created_by", id)
			.order("published_on", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				latest = val.data || undefined;
				error = val.error;
			}),

		supabase
			.from<PostWithBlogger>(SUPABASE_POST_TABLE)
			.select(
				"id,published,published_on,title,description,language,bloggers(name),created_by"
			)
			.eq("created_by", id)
			.order("upvote_count", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				greatest = val.data || undefined;
				error = val.error;
			}),
	]);
	if (error) {
		return { props: {}, redirect: "/" };
	}

	if (!userData) return { props: {}, redirect: "/" };

	if (userData.about) {
		const aboutMd2Html = await mdToHtml(userData.about);
		userData = { ...userData, htmlAbout: aboutMd2Html };
	}

	return {
		props: {
			latest: latest || [],
			greatest: greatest || [],
			profileUser: userData || [],
		},
	};
};

export default Profile;
