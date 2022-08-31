import { PostgrestError, User } from "@supabase/supabase-js";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo, useState } from "react";
import { MdCancel } from "react-icons/md";
import {
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

interface ProfileProps {
	loggedInUser?: User | null;
	posts?: Partial<Post>[] | null;
	profileUser?: Blogger | null;
}

interface UserQueryResult {
	data: Blogger[] | null;
	error: PostgrestError | null;
}

interface PostQueryResult {
	data: Partial<Post>[] | null;
	error: PostgrestError | null;
}

function calculateValidPosts(
	posts: Partial<Post>[] | null,
	status: "published" | "unpublished",
	user: User | null,
	profileId: string
): Partial<Post>[] {
	if (!posts) return [];
	const owner = user?.id === profileId;
	if (owner) {
		if (status === "published") {
			return posts.filter((post) => post.published);
		}
		return posts.filter((post) => !post.published);
	}
	return posts.filter((post) => post.published);
}

function Profile({ loggedInUser, profileUser, posts }: ProfileProps) {
	const [file, setFile] = useState<File | null>();
	const [uploading, setUploading] = useState(false);
	const [user, setUser] = useState(loggedInUser);
	const [profile, setProfile] = useState(profileUser);
	const [section, setSection] = useState<"posts" | "about">("posts");
	const [postType, setPostType] = useState<"published" | "unpublished">(
		"published"
	);
	const [editing, setEditing] = useState(false);
	const [clientPosts, setClientPosts] = useState(posts);
	const router = useRouter();
	const { id } = router.query;
	const { user: contextUser } = useContext(UserContext);

	const memoizedPosts = useMemo(
		() =>
			calculateValidPosts(
				clientPosts || null,
				postType,
				user || null,
				id as string
			),
		[clientPosts, postType, user, id]
	);

	useEffect(() => {
		if (contextUser) {
			setUser(contextUser);
		}
		if (!loggedInUser && !contextUser) {
			setUser(null);
		}
	}, [loggedInUser, contextUser]);

	// const onUpload: FormEventHandler = async (e) => {
	// 	e.preventDefault();
	// 	setUploading(true);
	// 	if (!file) {
	// 		alert("Please select a file");
	// 		return;
	// 	}

	// 	const fileExt = file.name.split(".").pop();
	// 	if (fileExt !== "md") {
	// 		alert("Please enter a markdown file");
	// 		return;
	// 	}

	// 	const {
	// 		data: { title, language, description },
	// 	}: { data: FileMetadata } = matter(await file.text());
	// 	if (!title || !language || !description) {
	// 		alert(
	// 			`Please structure your markdown file correctly, these properties are missing: ${
	// 				title ? "" : "title"
	// 			} ${description ? "" : ", description"} ${
	// 				language ? "" : ", language"
	// 			}`
	// 		);
	// 		return;
	// 	}

	// 	const { error } = await supabase.storage
	// 		.from(SUPABASE_BUCKET_NAME)
	// 		.upload(`${id}/${file.name}`, file);
	// 	if (error) {
	// 		alert(error.message);
	// 		console.log(error);
	// 		return;
	// 	}

	// 	const { error: postTableError } = await supabase
	// 		.from(SUPABASE_POST_TABLE)
	// 		.upsert({
	// 			created_by: id,
	// 			title,
	// 			description,
	// 			language: language.toLowerCase(),
	// 			filename: `${id}/${file.name}`,
	// 		} as Post);
	// 	if (postTableError) {
	// 		alert(postTableError.message);
	// 		console.log(postTableError);
	// 		return;
	// 	}

	// 	setUploading(false);
	// 	alert("file uploaded successfully");
	// 	supabase
	// 		.from(SUPABASE_POST_TABLE)
	// 		.select("id, created_at")
	// 		.eq("title", title)
	// 		.then((val) => {
	// 			if (!val || !val.data || val.data.length == 0) return;
	// 			let post = val.data.at(0) as Post;
	// 			setClientPosts((prev) => {
	// 				let newPost: Partial<Post> = {
	// 					title,
	// 					created_by: id as string,
	// 					description,
	// 					language: language.toLowerCase(),
	// 					published: false,
	// 					id: post.id,
	// 					created_at: post.created_at,
	// 					filename: `${id}/${file.name}`,
	// 				};
	// 				if (!prev) return [newPost];
	// 				return [newPost, ...prev];
	// 			});

	// 			setFile(null);
	// 		});
	// };
	return (
		<Layout
			user={user || null}
			route={router.asPath}
			logoutCallback={() => setUser(null)}
		>
			<UploadModal userId={user!.id} setClientPosts={setClientPosts} />
			<div className="grid grid-cols-1 grow-1 min-h-0 overflow-y-auto lg:grid-cols-6 text-white gap-y-10 lg:px-64 xl:px-80 px-5 md:px-32">
				<div className="lg:col-span-2">
					<div className="flex flex-col items-center lg:w-fit w-full">
						<div className="rounded-full overflow-hidden">
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
						<p className="text-lg font-normal">{profile?.name}</p>
					</div>
				</div>
				<div className="lg:col-span-4 ">
					<div className="flex justify-between items-center mb-4">
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
						{section === "posts" ? (
							<label
								htmlFor="upload"
								className="btn font-normal btn-sm normal-case bg-slate-700 text-white"
							>
								New Post
							</label>
						) : (
							user?.id === id &&
							(editing ? (
								<button
									className="btn btn-xs bg-cyan-500 hover:bg-cyan-600 "
									onClick={() => setEditing(false)}
								>
									<MdCancel className="text-black h-5 w-6" />
								</button>
							) : (
								<div
									className="capitalize bg-cyan-500 hover:bg-cyan-600 text-black btn btn-sm"
									onClick={() => setEditing(true)}
								>
									Edit
								</div>
							))
						)}
					</div>
					{section === "posts" ? (
						<>
							{user?.id === id && (
								<select
									name=""
									id=""
									className="select select-sm font-normal"
									onChange={(e) =>
										setPostType(e.target.value as any)
									}
									value={postType}
								>
									<option value="published">Published</option>
									<option value="unpublished">
										Unpublished
									</option>
								</select>
							)}
							<div className="flex flex-col gap-8 mt-5">
								{clientPosts &&
									memoizedPosts.map((post) => {
										if (
											postType === "published" &&
											!post.published
										)
											return <></>;
										if (
											postType === "unpublished" &&
											(post.published || !user)
										)
											return <></>;
										return (
											<PostComponent
												key={post.id!}
												description={post.description!}
												title={post.title!}
												postId={post.id!}
												publishedOn={post.published_on}
												authorId={post.created_by!}
												author={profile?.name!}
												owner={user?.id === id}
												published={post.published}
												filename={post.filename}
												setClientPosts={setClientPosts}
											/>
										);
									})}
							</div>
						</>
					) : (
						<About
							id={profileUser?.id}
							editing={editing}
							owner={user?.id === id}
							markdown={profile?.about}
							setProfile={setProfile}
							setEditing={setEditing}
						/>
					)}
				</div>
			</div>
		</Layout>
	);
}

export const getServerSideProps: GetServerSideProps<
	ProfileProps,
	{ id: string }
> = async (context) => {
	const id = context.params?.id;
	if (!id) return { props: {}, redirect: { destination: "/" } };
	const { user } = await supabase.auth.api.getUserByCookie(context.req);
	supabase.auth.session = () => ({
		access_token: context.req.cookies["sb-access-token"] || "",
		token_type: "bearer",
		user,
	});

	const { data, error }: UserQueryResult = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("id, name, avatar_url,about")
		.eq("id", id);

	const { data: postData, error: postError }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("*")
		.eq("created_by", id);

	if (error || postError || !data || !postData) {
		console.log("error -> ", error);
		console.log("postError -> ", postError);
	}
	return {
		props: {
			loggedInUser: user,
			posts: postData,
			profileUser: data?.at(0) || null,
		},
	};
};

export default Profile;
