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
	posts?: Partial<Post>[] | null;
	profileUser?: Blogger | null;
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

function Profile({ profileUser, posts }: ProfileProps) {
	const [profile, setProfile] = useState(profileUser);
	const [section, setSection] = useState<"posts" | "about">("posts");
	const [postType, setPostType] = useState<"published" | "unpublished">(
		"published"
	);
	const [editing, setEditing] = useState(false);
	const [publicPosts, setPublicPosts] = useState(posts);
	const router = useRouter();
	const { id } = router.query;
	const { user } = useContext(UserContext);

	const memoizedPosts = useMemo(
		() =>
			calculateValidPosts(
				publicPosts || null,
				postType,
				user || null,
				id as string
			),
		[publicPosts, postType, user, id]
	);

	return (
		<Layout user={user || null} route={router.asPath}>
			<>
				{user?.id === id && (
					<UploadModal
						userId={user!.id}
						setClientPosts={setPublicPosts}
					/>
				)}
			</>
			<div className="grid grid-cols-1 grow-1 min-h-0 overflow-y-auto lg:grid-cols-6 text-white gap-y-10 lg:px-64 xl:px-80 px-5 md:px-32">
				<div className="lg:col-span-2">
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
						{user?.id === id && section === "posts" ? (
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
								{publicPosts &&
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
												setClientPosts={setPublicPosts}
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
