import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	LIMIT,
	SEARCH_UPVOTED_POSTS_FUNCTION,
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
	SUPABASE_UPVOTES_TABLE,
} from "../../../utils/constants";
import { fetchUpvotes } from "../../../utils/fetchUpvotes";
import mdToHtml from "../../../utils/mdToHtml";
import { sendRevalidationRequest } from "../../../utils/sendRequest";
import { supabase } from "../../../utils/supabaseClient";
import { About } from "../../components/About";
import { DeleteModal } from "../../components/DeleteModal";
import Layout from "../../components/Layout";
import PostDisplay from "../../components/PostDisplay";
import { PublishModal } from "../../components/PublishModal";
import SearchComponent from "../../components/SearchComponent";
import { UnPublishModal } from "../../components/UnPublishModal";
import { UploadModal } from "../../components/UploadModal";
import UserDisplay from "../../components/UserDisplay";
import Blogger from "../../interfaces/Blogger";
import Post from "../../interfaces/Post";
import Upvotes from "../../interfaces/Upvotes";
import { UserContext } from "../_app";

interface ProfileProps {
	latest?: Partial<Post>[];
	greatest?: Partial<Post>[];
	profileUser?: Blogger;
}

type PostType = "published" | "unpublished" | "upvoted";
type SortType = "greatest" | "latest";

function Profile({ profileUser, latest, greatest }: ProfileProps) {
	const [profile, setProfile] = useState(profileUser);
	const [section, setSection] = useState<"posts" | "about">("posts");
	const [postType, setPostType] = useState<PostType>("published");
	const [editingAbout, setEditingAbout] = useState(false);
	const [publicPosts, setPublicPosts] = useState<
		Partial<Post>[] | null | undefined
	>(latest);
	const [privatePosts, setPrivatePosts] = useState<Partial<Post>[] | null>();
	const [searchResults, setSearchResults] = useState<Post[]>();
	const [greatestPosts, setGreatestPosts] = useState<
		Partial<Post>[] | null | undefined
	>(greatest);
	const [upvotedPosts, setUpvotedPosts] = useState<Partial<Post>[]>();
	const [upvotedSearchPosts, setUpvotedSearchPosts] =
		useState<Partial<Post>[]>();
	const router = useRouter();
	const { user } = useContext(UserContext);

	const [about, setAbout] = useState<string | undefined>(profile?.about);
	const [htmlAbout, setHtmlAbout] = useState("");
	const [previewing, setPreviewing] = useState(false);
	const [sortType, setSortType] = useState<SortType>("latest");
	const [searchQuery, setSearchQuery] = useState("");

	const [postInAction, setPostInAction] = useState<Partial<Post> | null>(
		null
	);

	const id = profileUser?.id || null;

	useEffect(() => {
		const aboutMd2Html = async () => {
			if (!about) return;
			const html = await mdToHtml(about);
			setHtmlAbout(html);
		};

		aboutMd2Html();
	}, [about]);

	useEffect(() => {
		checkGreatestStillGreatest(greatest);
		fetchUpvotes(publicPosts, setPublicPosts);
		fetchUpvotes(greatestPosts, setGreatestPosts);
	}, []);

	const onAboutSave = async () => {
		const { data, error } = await supabase
			.from(SUPABASE_BLOGGER_TABLE)
			.update({ about })
			.eq("id", profile?.id);
		if (error || !data || data.length == 0) {
			alert("Error in updating about");
			return;
		}
		setProfile(data.at(0));
		setEditingAbout(false);
		sendRevalidationRequest(`profile/${profile?.id}`);
	};

	useEffect(() => {
		if (postType === "published") {
			if (!publicPosts || publicPosts.length == 0) {
				if (profileUser?.id === user?.id) setPostType("unpublished");
				setPostType("upvoted");
			}
			return;
		}

		if (postType === "unpublished") {
			if (!privatePosts || privatePosts.length === 0) {
				supabase
					.from<Post>(SUPABASE_POST_TABLE)
					.select()
					.match({ created_by: profile?.id, published: false })
					.order("created_at", { ascending: false })
					.limit(LIMIT)
					.then((val) => {
						if (!val.data || val.data.length === 0) {
							setPostType("upvoted");
							return;
						}
						setPrivatePosts(val.data);
					});
			}
		}

		if (postType === "upvoted") {
			if (upvotedPosts !== undefined) return;
			fetchUpvotedPosts({});
		}
	}, [postType]);

	const checkGreatestStillGreatest = async (
		greatest?: Partial<Post>[] | null
	) => {
		if (!greatest) return;
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select("*")
			.match({ created_by: id, published: true })
			.order("upvote_count", { ascending: false })
			.limit(LIMIT);

		if (error || !data || data.length === 0) return;

		if (data.some((post, idx) => post.id !== greatest[idx].id)) {
			sendRevalidationRequest(`profile/${id}`);
		}
	};

	const modifyPosts = (
		type: typeof postType,
		newPosts: SetStateAction<Partial<Post>[] | null | undefined>
	) => {
		if (type === "published") {
			if (setPublicPosts) setPublicPosts(newPosts);
			return;
		}
		setPrivatePosts(newPosts);
	};

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
							created_at: modifiedData[post.id],
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
						created_at: modifiedData[post.id],
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
		if (setPublicPosts)
			setPublicPosts((prev) => [...(prev || []), ...data]);
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
		if (!cursor) {
			const { data, error } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select("*")
				.match({ created_by: profileUser?.id })
				.textSearch("search_index_col", searchTerm)
				.order("upvote_count", { ascending: false })
				.limit(LIMIT);

			if (error || !data) {
				console.log(error.message || "data returned is null");
				return false;
			}
			setSearchResults((prev) => [...(prev || []), ...data]);
			return data.length > 0;
		}
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select("*")
			.match({ created_by: profileUser?.id })
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
	};

	const fetchSearchUpvotes = async ({
		cursor,
		searchTerm,
	}: {
		cursor?: string | number;
		searchTerm?: string;
	}) => {
		console.log("This called");
		if (!searchTerm) return;

		if (!cursor) {
			const { data } = await supabase.rpc(SEARCH_UPVOTED_POSTS_FUNCTION, {
				user_id: profile?.id,
				search_term: searchTerm,
				cursor: null,
			});
			if (data) {
				let modifiedData = data.map((post) => ({
					...post,
					bloggers: { name: post.author },
				}));
				setUpvotedSearchPosts((prev) => [
					...(prev || []),
					...modifiedData,
				]);
			}
			return (data?.length || 0) > 0;
		}
		const { data } = await supabase.rpc(SEARCH_UPVOTED_POSTS_FUNCTION, {
			user_id: profile?.id,
			search_term: searchTerm,
			cursor,
		});
		if (data) {
			let modifiedData = data.map((post) => ({
				...post,
				bloggers: { name: post.author },
			}));
			setUpvotedSearchPosts((prev) => [...(prev || []), ...modifiedData]);
		}
		return (data?.length || 0) > 0;
	};

	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				<title>{`Profile-${profileUser?.name}`}</title>
				<meta name="author" content={profileUser?.name || ""} />
				<meta
					name="description"
					content={`Rce-Blog profile page of ${profileUser?.name}`}
				/>
				<meta
					property="og:title"
					content={`Rce Blog Profile of ${profileUser?.name}`}
				/>
				<meta
					property="og:description"
					content={`About - ${profileUser?.about.slice(0, 15)}...`}
				/>
				<meta
					property="og:url"
					content={`https://rce-blog.xyz/profile/${profileUser?.id}`}
				/>
				<meta property="og:site_name" content="Rce Blog" />
				<meta property="og:type" content="website" />
			</Head>
			<>
				{user?.id === id && (
					<UploadModal
						userId={user!.id}
						setClientPosts={setPrivatePosts}
					/>
				)}

				{postInAction && (
					<>
						<DeleteModal
							post={postInAction}
							modifyPosts={modifyPosts}
						/>
						{/* <EditModal
							post={postInAction}
							modifyPosts={modifyPosts}
						/> */}
						<PublishModal
							post={postInAction}
							modifyPosts={modifyPosts}
						/>
						<UnPublishModal
							post={postInAction}
							modifyPosts={modifyPosts}
						/>
					</>
				)}
			</>
			<div className="md:grid flex flex-col grow md:min-h-0 h-max overflow-y-auto  md:overflow-clip lg:grid-cols-7 text-white gap-y-10  xl:px-64 px-5 md:px-32">
				<div
					className={` lg:col-span-2 h-fit md:h-full
					`}
				>
					<UserDisplay profile={profile!} user={user || null} />
				</div>
				<div className="lg:col-span-5 flex flex-col  md:min-h-0 ">
					<div className="flex justify-between grow-0 items-center mb-4 sticky top-0 z-20 bg-slate-900">
						<div className="tabs">
							<p
								className={`tab tab-lifted ${
									section === "posts" ? "tab-active" : ""
								} font-normal text-white text-sm md:text-base`}
								onClick={() => setSection("posts")}
							>
								Posts
							</p>
							<p
								className={`tab tab-lifted ${
									section === "about" ? "tab-active" : ""
								}  font-normal text-white text-sm md:text-base `}
								onClick={() => setSection("about")}
							>
								About
							</p>
						</div>
						{user?.id !== id && section === "posts" && (
							<PostTypeSelecter
								{...{
									postType,
									sortType,
									setSortType,
									setPostType,
									owner: user?.id === profile?.id,
								}}
							/>
						)}
						{user?.id === id && section === "posts" ? (
							<label
								htmlFor="upload"
								className="btn font-normal btn-sm normal-case bg-base-100  text-white"
							>
								New Post
							</label>
						) : (
							user?.id === id &&
							(editingAbout ? (
								<div className="flex">
									<button
										className="normal-case btn btn-xs btn-ghost "
										onClick={() =>
											setPreviewing((prev) => !prev)
										}
										data-tip={`${
											previewing
												? "back to edit"
												: "preview"
										}`}
									>
										{previewing
											? "Back to Editing"
											: "Preview"}
									</button>
									<button
										className="btn btn-xs normal-case btn-ghost "
										onClick={onAboutSave}
									>
										Save
									</button>

									<button
										className="normal-case btn btn-xs btn-ghost "
										onClick={() => {
											setAbout(profileUser?.about);
											setEditingAbout(false);
											setPreviewing(false);
										}}
									>
										Cancel
									</button>
								</div>
							) : (
								<div
									className="btn font-normal btn-sm normal-case btn-ghost text-white"
									onClick={() => setEditingAbout(true)}
								>
									Edit
								</div>
							))
						)}
					</div>
					{section === "posts" ? (
						<>
							<div className="sticky top-8 pt-1 z-20 bg-slate-900">
								<div className="flex justify-between grow-0">
									{user?.id === id && (
										<select
											name=""
											id=""
											className="select select-sm font-normal"
											onChange={(e) =>
												setPostType(
													e.target.value as PostType
												)
											}
											value={postType}
										>
											<option value="published">
												Published
											</option>
											<option value="unpublished">
												Unpublished
											</option>
											<option value="upvoted">
												Upvoted
											</option>
										</select>
									)}

									{user?.id === id && (
										<PostTypeSelecter
											{...{
												postType,
												sortType,
												setSortType,
												setPostType,
												owner: user.id === profile?.id,
											}}
										/>
									)}
								</div>
								<div className="my-4 md:w-1/2">
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
							{(searchResults?.length ||
								upvotedSearchPosts?.length ||
								0) > 0 ? (
								<>
									{postType === "upvoted" ? (
										<PostDisplay
											posts={upvotedSearchPosts || []}
											cursorKey="upvote_count"
											searchTerm={searchQuery}
											owner={false}
											fetchPosts={fetchSearchUpvotes}
										/>
									) : (
										<PostDisplay
											posts={searchResults || []}
											author={profileUser?.name || ""}
											cursorKey="upvote_count"
											searchTerm={searchQuery}
											owner={user?.id === id}
											fetchPosts={fetchSearchPosts}
											setPostInAction={setPostInAction}
										/>
									)}
								</>
							) : (
								<>
									{postType === "published" && (
										<>
											<>
												{sortType === "latest" && (
													<PostDisplay
														posts={
															publicPosts || []
														}
														owner={user?.id === id}
														setPostInAction={
															setPostInAction
														}
														author={
															profile?.name ||
															undefined
														}
														cursorKey={
															"published_on"
														}
														fetchPosts={
															fetchLatestPosts
														}
													/>
												)}
											</>
											<>
												{sortType === "greatest" && (
													<PostDisplay
														posts={
															greatestPosts || []
														}
														owner={user?.id === id}
														setPostInAction={
															setPostInAction
														}
														author={
															profile?.name ||
															undefined
														}
														cursorKey={
															"upvote_count"
														}
														fetchPosts={
															fetchGreatestPosts
														}
													/>
												)}
											</>
										</>
									)}

									{postType === "unpublished" && (
										<PostDisplay
											posts={privatePosts || []}
											owner={user?.id === id}
											author={profile?.name || undefined}
											setPostInAction={setPostInAction}
											cursorKey={"created_at"}
											fetchPosts={fetchPrivatePosts}
										/>
									)}
									{postType === "upvoted" && (
										<PostDisplay
											posts={upvotedPosts || []}
											owner={false}
											cursorKey={"created_at"}
											fetchPosts={fetchUpvotedPosts}
										/>
									)}
								</>
							)}
						</>
					) : (
						<div className="mt-6 pl-2">
							<About
								about={about || ""}
								htmlAbout={htmlAbout || ""}
								previewing={previewing}
								setAbout={setAbout}
								editing={editingAbout}
								owner={user?.id === id}
							/>
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}

function PostTypeSelecter({
	postType,
	setSortType,
	sortType,
	setPostType,
	owner,
}: {
	owner: boolean;
	postType: PostType;
	sortType: SortType;
	setSortType: Dispatch<SetStateAction<SortType>>;
	setPostType: Dispatch<SetStateAction<PostType>>;
}) {
	return (
		<select
			name=""
			id=""
			className={` select select-sm font-normal ${
				postType === "unpublished" || (postType === "upvoted" && owner)
					? "invisible"
					: ""
			}`}
			value={postType === "upvoted" ? "upvoted" : sortType}
			onChange={(e) => {
				if (
					e.target.value === "latest" ||
					e.target.value === "greatest"
				) {
					setSortType(e.target.value);
					setPostType("published");
					return;
				}
				setPostType(e.target.value as "upvoted");
			}}
		>
			<option value="latest">Latest</option>
			<option value="greatest">Greatest</option>
			{!owner && <option value="upvoted">Upvoted</option>}
		</select>
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

	let userData: Blogger | undefined;
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
			.from<Post>(SUPABASE_POST_TABLE)
			.select("id,published,published_on,title,description,language")
			.eq("created_by", id)
			.order("published_on", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				latest = val.data || undefined;
				error = val.error;
			}),

		supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select("id,published,published_on,title,description,language")
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
	return {
		props: {
			latest,
			greatest,
			profileUser: userData,
		},
	};
};

export default Profile;
