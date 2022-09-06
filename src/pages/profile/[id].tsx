import { PostgrestError, User } from "@supabase/supabase-js";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	ChangeEventHandler,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { MdCancel } from "react-icons/md";
import {
	LIMIT,
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";
import { About } from "../../components/About";
import Layout from "../../components/Layout";
import PostComponent from "../../components/PostComponent";
import Blogger from "../../interfaces/Blogger";
import Post from "../../interfaces/Post";
import { UserContext } from "../_app";
import { UploadModal } from "../../components/UploadModal";
import { VscPreview } from "react-icons/vsc";
import { AiOutlineFileDone } from "react-icons/ai";
import mdToHtml from "../../../utils/mdToHtml";
import PostDisplay from "../../components/PostDisplay";
import { DeleteModal } from "../../components/DeleteModal";
import { EditModal } from "../../components/EditModal";
import { PublishModal } from "../../components/PublishModal";
import { UnPublishModal } from "../../components/UnPublishModal";
import Head from "next/head";
import SearchComponent from "../../components/SearchComponent";
import PostWithBlogger from "../../interfaces/PostWithBlogger";
import { sendRevalidationRequest } from "../../../utils/sendRequest";

interface ProfileProps {
	posts?: Partial<Post>[] | null;
	profileUser?: Blogger | null;
}

function Profile({ profileUser, posts }: ProfileProps) {
	const [profile, setProfile] = useState(profileUser);
	const [section, setSection] = useState<"posts" | "about">("posts");
	const [postType, setPostType] = useState<"published" | "unpublished">(
		"published"
	);
	const [editingAbout, setEditingAbout] = useState(false);
	const [publicPosts, setPublicPosts] = useState(posts);
	const [privatePosts, setPrivatePosts] = useState<Partial<Post>[] | null>();
	const [searchResults, setSearchResults] = useState<Post[]>();
	const router = useRouter();
	const { id } = router.query;
	const { user } = useContext(UserContext);

	const [about, setAbout] = useState(profile?.about);
	const [htmlAbout, setHtmlAbout] = useState("");
	const [previewing, setPreviewing] = useState(false);
	const [sortType, setSortType] = useState<"greatest" | "latest">("latest");
	const [searchQuery, setSearchQuery] = useState("");

	const [postInAction, setPostInAction] = useState<Partial<Post> | null>(
		null
	);

	useEffect(() => {
		const aboutMd2Html = async () => {
			if (!about) return;
			const html = await mdToHtml(about);
			setHtmlAbout(html);
		};

		aboutMd2Html();
	}, [about]);

	const onAboutSave = async () => {
		const { data, error } = await supabase
			.from(SUPABASE_BLOGGER_TABLE)
			.update({ about })
			.eq("id", id);
		if (error || !data || data.length == 0) {
			alert("Error in updating about");
			return;
		}
		setProfile(data.at(0));
		setEditingAbout(false);
	};

	const onPostTypeChange: ChangeEventHandler<HTMLSelectElement> = async (
		e
	) => {
		e.preventDefault();

		setPostType(e.target.value as "published" | "unpublished");

		if (e.target.value === "published") {
			return;
		}

		if (!privatePosts || privatePosts.length === 0) {
			const { data } = await supabase
				.from<Post>(SUPABASE_POST_TABLE)
				.select()
				.match({ created_by: id, published: false })
				.order("created_at", { ascending: false })
				.limit(LIMIT);
			setPrivatePosts(data);
		}
	};

	const modifyPosts = (
		type: typeof postType,
		newPosts: SetStateAction<Partial<Post>[] | null | undefined>
	) => {
		if (type === "published") {
			setPublicPosts(newPosts);
			return;
		}
		setPrivatePosts(newPosts);
	};

	const fetchPrivatePosts = async (cursor: string | number) => {
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileUser?.id, published: false })
			.lt("created_at", cursor)
			.order("created_at", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return;
		}
		setPrivatePosts((prev) => [...(prev || []), ...data]);
	};
	const fetchPublicPosts = async (cursor: string | number) => {
		const { data, error } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select()
			.match({ created_by: profileUser?.id, published: true })
			.lt("published_on", cursor)
			.order("published_on", { ascending: false })
			.limit(LIMIT);

		if (error || !data) {
			console.log(error.message || "data returned is null");
			return;
		}
		setPublicPosts((prev) => [...(prev || []), ...data]);
	};
	const fetchSearchPosts = async (
		cursor: string | number,
		searchTerm?: string
	) => {
		if (!searchTerm) return;
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
			return;
		}
		setSearchResults((prev) => [...(prev || []), ...data]);
	};

	return (
		<Layout user={user || null} route={router.asPath}>
			<Head>
				<title>{`Profile-${profileUser?.name}`}</title>
				<meta name="author" content={profileUser?.name || ""} />
				<meta
					name="description"
					content={`Rce-Blog profile page for blogger ${profileUser?.name}`}
				/>
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
						<EditModal
							post={postInAction}
							modifyPosts={modifyPosts}
						/>
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
			<div className="grid grid-cols-1 grow min-h-0 overflow-clip lg:grid-cols-7 text-white gap-y-10 lg:px-64 xl:px-64 px-5 md:px-32">
				<div className="lg:col-span-2 h-fit">
					<div className="flex flex-col gap-4 items-center lg:w-fit w-full">
						<div className="avatar">
							<div className="rounded-md">
								{profile?.avatar_url && (
									<Image
										src={profile.avatar_url}
										width={128}
										height={128}
										layout="fixed"
										className=""
									/>
								)}
							</div>
						</div>
						<h1 className="text-lg font-normal">{profile?.name}</h1>
					</div>
				</div>
				<div className="lg:col-span-5 flex flex-col max-h-full min-h-0 px-1">
					<div className="flex justify-between grow-0 items-center mb-4">
						<div className="tabs">
							<p
								className={`tab tab-lifted ${
									section === "posts" ? "tab-active" : ""
								} font-normal text-white text-base `}
								onClick={() => setSection("posts")}
							>
								Posts
							</p>
							<p
								className={`tab tab-lifted ${
									section === "about" ? "tab-active" : ""
								}  font-normal text-white text-base `}
								onClick={() => setSection("about")}
							>
								About
							</p>
						</div>
						{user?.id === id && section === "posts" ? (
							<label
								htmlFor="upload"
								className="btn font-normal btn-sm normal-case btn-ghost text-white"
							>
								New Post
							</label>
						) : (
							user?.id === id &&
							(editingAbout ? (
								<div className="flex">
									<button
										className="btn btn-xs btn-ghost tooltip tooltip-left"
										onClick={() =>
											setPreviewing((prev) => !prev)
										}
										data-tip={`${
											previewing
												? "back to edit"
												: "preview"
										}`}
									>
										<VscPreview size={20} />
									</button>
									<button
										className="btn btn-xs btn-ghost tooltip tooltip-left"
										onClick={onAboutSave}
										data-tip="save"
									>
										<AiOutlineFileDone size={20} />
									</button>

									<button
										className="btn btn-xs btn-ghost tooltip tooltip-left"
										onClick={() => {
											setAbout(profileUser?.about);
											setEditingAbout(false);
											setPreviewing(false);
										}}
										data-tip="cancel"
									>
										<MdCancel className="text-white h-5 w-6" />
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
							<div className="flex justify-between grow-0">
								{user?.id === id && (
									<select
										name=""
										id=""
										className="select select-sm font-normal"
										onChange={onPostTypeChange}
										value={postType}
									>
										<option value="published">
											Published
										</option>
										<option value="unpublished">
											Unpublished
										</option>
									</select>
								)}
								<div className="w-1/2">
									<SearchComponent
										setPosts={setSearchResults}
										profileId={profileUser?.id}
										setSearchQuery={setSearchQuery}
									/>
								</div>
								{
									<select
										name=""
										id=""
										className={` select select-sm font-normal ${
											postType === "published"
												? ""
												: "invisible"
										}`}
										value={sortType}
										onChange={(e) =>
											setSortType(
												e.target.value as
													| "greatest"
													| "latest"
											)
										}
									>
										<option value="latest">Latest</option>
										<option value="greatest">
											Greatest
										</option>
									</select>
								}
							</div>
							{(searchResults?.length || 0) > 0 ? (
								<PostDisplay
									posts={searchResults || []}
									author={profileUser?.name || ""}
									cursorKey="upvote_count"
									searchTerm={searchQuery}
									owner={user?.id === id}
									fetchPosts={fetchSearchPosts}
									setPostInAction={setPostInAction}
								/>
							) : postType === "published" ? (
								<PostDisplay
									posts={publicPosts || []}
									owner={user?.id === id}
									author={profile?.name || undefined}
									cursorKey={"published_on"}
									fetchPosts={fetchPublicPosts}
									searchTerm={searchQuery}
								/>
							) : (
								<PostDisplay
									posts={privatePosts || []}
									owner={user?.id === id}
									author={profile?.name || undefined}
									setPostInAction={setPostInAction}
									cursorKey={"created_at"}
									fetchPosts={fetchPrivatePosts}
									searchTerm={searchQuery}
								/>
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

export const getStaticPaths: GetStaticPaths = async () => {
	return { paths: [], fallback: true };
};
export const getStaticProps: GetStaticProps<
	ProfileProps,
	{ id: string }
> = async (context) => {
	const id = context.params!.id;

	let userData, postData, error;

	await Promise.all([
		supabase
			.from<Blogger>(SUPABASE_BLOGGER_TABLE)
			.select("id, name, avatar_url,about")
			.eq("id", id)
			.then((val) => {
				userData = val.data?.at(0);
				error = val.error;
			}),

		supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.select("*")
			.eq("created_by", id)
			.order("published_on", { ascending: false })
			.limit(LIMIT)
			.then((val) => {
				postData = val.data;
				error = val.error;
			}),
	]);

	return {
		props: {
			posts: postData,
			profileUser: userData,
		},
	};
};

export default Profile;
