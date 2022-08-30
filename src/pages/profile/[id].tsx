import { PostgrestError, User } from "@supabase/supabase-js";
import matter from "gray-matter";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import {
	ChangeEventHandler,
	Dispatch,
	FormEventHandler,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { FiUpload } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_FILES_BUCKET,
	SUPABASE_IMAGE_BUCKET,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import mdToHtml from "../../../utils/mdToHtml";
import { supabase } from "../../../utils/supabaseClient";
import { About } from "../../components/About";
import Layout from "../../components/Layout";
import PostComponent from "../../components/PostComponent";
import Blogger from "../../interfaces/Blogger";
import FileMetadata from "../../interfaces/FileMetdata";
import Post from "../../interfaces/Post";
import { UserContext } from "../_app";

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
			<div className="grid grid-cols-1 lg:grid-cols-6 text-white gap-y-10 px-80">
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
						<p className="text-xl font-semibold">{profile?.name}</p>
					</div>
				</div>
				<div className="lg:col-span-4 ">
					<div className="flex justify-between items-center mb-10">
						<div className="tabs">
							<p
								className={`tab tab-lifted ${
									section === "posts" ? "tab-active" : ""
								}  font-semibold text-white text-base `}
								onClick={() => setSection("posts")}
							>
								Posts
							</p>
							<p
								className={`tab tab-lifted ${
									section === "about" ? "tab-active" : ""
								}  font-semibold text-white text-base `}
								onClick={() => setSection("about")}
							>
								About
							</p>
						</div>
						{section === "posts" ? (
							<label
								htmlFor="upload"
								className="btn btn-sm normal-case btn-ghost"
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
									className="select select-sm mt-5"
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

function UploadModal({
	userId,
	setClientPosts,
}: {
	userId: string;
	setClientPosts: Dispatch<
		SetStateAction<Partial<Post>[] | null | undefined>
	>;
}) {
	const [mdfile, setMdFile] = useState<File | null>();
	const [numImageTags, setNumImageTags] = useState(0);
	const [images, setImages] = useState<File[] | null>();
	const [uploading, setUploading] = useState(false);
	const [alertText, setAlert] = useState("");
	const [postDets, setPostDets] = useState<FileMetadata>();

	const cancelButton = useRef<HTMLLabelElement>(null);

	const setAlertTimer = (text: string) => {
		setAlert(text);
		setTimeout(() => setAlert(""), 3 * 1000);
	};

	const onFileSelect: ChangeEventHandler<HTMLInputElement> = async (e) => {
		e.preventDefault();
		const file = e.target.files?.item(0);
		if (!file || file.name.split(".").at(1) !== "md") {
			setAlertTimer("Please select a markdown file");
			return;
		}

		const contents = await file.text();
		const { data } = matter(contents);
		if (!data.title) {
			setAlertTimer(
				`Please structure your markdown file correctly, title is missing`
			);
			return;
		}
		setPostDets({ ...(data as FileMetadata) });

		const numImageTags = Array.from(
			contents.matchAll(/!\[.*\]\(.*\)/g)
		).length;
		setMdFile(file);
		setNumImageTags(numImageTags);
	};

	const cleanUp = () => {
		setUploading(false);
		setImages(null);
		setNumImageTags(0);
		setMdFile(null);
		cancelButton.current?.dispatchEvent(new Event("click"));
	};
	const onFinalUpload = async () => {
		if (!mdfile) {
			setAlertTimer("Please select a markdown file");
			return;
		}
		if (numImageTags > 0 && (!images || images.length === 0)) {
			setAlertTimer(`Please select ${numImageTags} images`);
			return;
		}
		if ((images?.length || 0) < numImageTags) {
			setAlertTimer(`Please select ${numImageTags} images`);
			return;
		}
		setUploading(true);

		const blogFolder = `${userId}/${postDets?.title}`;
		const blogFilePath = blogFolder + `/${mdfile.name}`;

		const { data, error } = await supabase.storage
			.from(SUPABASE_FILES_BUCKET)
			.upload(blogFilePath, mdfile);

		if (error || !data) {
			console.log(error || "Supabase didn't return any data");
			setAlertTimer(error?.message || "" + " Please retry");
			setUploading(false);
			return;
		}

		if (numImageTags === 0) {
			cleanUp();
			return;
		}

		const imageResults = await Promise.all(
			images!.map(async (image) => {
				const imagePath = blogFolder + `/${image.name}`;
				const result = await supabase.storage
					.from(SUPABASE_IMAGE_BUCKET)
					.upload(imagePath, image);
				return result;
			})
		);
		if (imageResults.some((res) => res.error !== null)) {
			setAlertTimer("Error in uploading images, please retry");
			setUploading(false);
			return;
		}

		const filename = data.Key.match(
			new RegExp(`${SUPABASE_FILES_BUCKET}/(.*)`)
		)?.at(1);
		const { data: postTableData, error: postTableError } = await supabase
			.from<Post>(SUPABASE_POST_TABLE)
			.insert({
				created_by: userId,
				title: postDets?.title,
				language: postDets?.language,
				description: postDets?.description,
				filename,
			});
		if (postTableError || !postTableData || postTableData.length === 0) {
			setAlertTimer(
				postTableError?.message ||
					"null data returned by supabase" + " Please retry"
			);
			setUploading(false);
			return;
		}

		setClientPosts((prev) => [
			postTableData.at(0) as Post,
			...(prev || []),
		]);

		setAlertTimer("");
		cleanUp();
	};

	return (
		<>
			<input type="checkbox" id="upload" className="modal-toggle" />
			<div className="modal">
				<div className="modal-box shadow-md shadow-slate-600 bg-slate-800">
					<label
						htmlFor="file"
						className="text-white font-semibold mr-2"
					>
						Select markdown file:
					</label>
					<input
						type="file"
						name=""
						id="file"
						onChange={onFileSelect}
						accept=".md"
						className="file:rounded-xl file:text-sm"
					/>
					{numImageTags > 0 && (
						<div className="mt-4">
							<label
								htmlFor="blogImages"
								className="text-white font-semibold mr-2"
							>
								Please upload {numImageTags}
								{numImageTags > 1 ? " images" : " image"}:
							</label>
							<input
								type="file"
								id="blogImages"
								max={numImageTags}
								multiple
								accept="image/*"
								className="file:rounded-xl file:text-sm"
								onChange={(e) =>
									setImages(Array.from(e.target.files || []))
								}
							/>
						</div>
					)}
					{alertText && <p className="text-red-400">{alertText}</p>}
					<div className="modal-action">
						<div
							className="btn btn-sm normal-case text-white "
							onClick={onFinalUpload}
						>
							Upload
						</div>
						<label
							htmlFor="upload"
							className="btn btn-sm normal-case text-white"
							ref={cancelButton}
						>
							Cancel
						</label>
					</div>
				</div>
			</div>
		</>
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
