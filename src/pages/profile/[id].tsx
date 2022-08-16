import { PostgrestError, User } from "@supabase/supabase-js";
import matter from "gray-matter";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { FormEventHandler, useContext, useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_BUCKET_NAME,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";
import Layout from "../../components/Layout";
import PostComponent from "../../components/PostComponent";
import Blogger from "../../interfaces/Blogger";
import FileMetadata from "../../interfaces/FileMetdata";
import Post from "../../interfaces/Post";
import { UserContext } from "../_app";

interface ProfileProps {
	loggedInUser?: User | null;
	name?: string | null;
	posts?: Post[] | null;
	avatar_url?: string | null;
}

interface UserQueryResult {
	data: Blogger[] | null;
	error: PostgrestError | null;
}

interface PostQueryResult {
	data: Post[] | null;
	error: PostgrestError | null;
}

function Profile({ loggedInUser, name, posts, avatar_url }: ProfileProps) {
	const router = useRouter();
	const { id } = router.query;
	const [file, setFile] = useState<File | null>();
	const [uploading, setUploading] = useState(false);
	const { user: contextUser } = useContext(UserContext);
	const [user, setUser] = useState(loggedInUser);

	useEffect(() => {
		if (contextUser) {
			setUser(contextUser);
		}
		if (!loggedInUser && !contextUser) {
			setUser(null);
		}
	}, [loggedInUser, contextUser]);

	const onUpload: FormEventHandler = async (e) => {
		e.preventDefault();
		setUploading(true);
		if (!file) {
			alert("Please select a file");
			return;
		}

		const fileExt = file.name.split(".").pop();
		if (fileExt !== "md") {
			alert("Please enter a markdown file");
			return;
		}

		const {
			data: { title, language, description },
		}: { data: FileMetadata } = matter(await file.text());
		if (!title || !language || !description) {
			alert(
				`Please structure your markdown file correctly, missing these properties: ${
					title ? "" : "title"
				} ${description ? "" : ", description"} ${
					language ? "" : ", language"
				}`
			);
			return;
		}

		const { error } = await supabase.storage
			.from(SUPABASE_BUCKET_NAME)
			.upload(`${id}/${file.name}`, file);
		if (error) {
			alert(error.message);
			console.log(error);
			return;
		}

		const { error: postTableError } = await supabase
			.from(SUPABASE_POST_TABLE)
			.upsert({
				created_by: id,
				title,
				description,
				language: language.toLowerCase(),
				filename: `${id}/${file.name}`,
			} as Post);
		if (postTableError) {
			alert(postTableError.message);
			console.log(postTableError);
			return;
		}

		setUploading(false);
		setFile(null);
		alert("file uploaded successfully");
	};
	return (
		<Layout
			user={user || null}
			route={router.asPath}
			logoutCallback={() => setUser(null)}
		>
			<div className="grid grid-cols-6 text-white ">
				<div className="col-span-2">
					<div className="flex flex-col items-center w-fit">
						<div className="rounded-full overflow-hidden">
							{avatar_url && (
								<Image
									src={avatar_url}
									width={128}
									height={128}
									layout="fixed"
									className=""
								/>
							)}
						</div>
						<p className="text-xl font-semibold">{name}</p>
					</div>
				</div>
				<div className="col-start-3 col-span-4">
					<div className="flex justify-between items-center">
						<p className="text-3xl font-semibold">Posts</p>
						<div className="flex gap-1">
							{user?.id === id && !file && (
								<button className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600  p-1 rounded-md font-normal text-sm text-black">
									<label htmlFor="file">New Post</label>
									<input
										type="file"
										id="file"
										className="hidden"
										onChange={(e) =>
											setFile(e.target.files?.item(0))
										}
									/>
								</button>
							)}
							{file && (
								<button
									className={`btn btn-sm bg-cyan-500 hover:bg-cyan-600 ${
										uploading ? "loading" : ""
									}`}
									onClick={onUpload}
								>
									<div className="flex normal-case text-black items-center gap-2">
										<FiUpload className="text-black" />
										{file.name}
									</div>
								</button>
							)}
							{file && (
								<button
									className="btn btn-sm bg-cyan-500 hover:bg-cyan-600 "
									onClick={() => setFile(null)}
								>
									<MdCancel className="text-black h-6 w-6" />
								</button>
							)}
						</div>
					</div>
					<div className="flex flex-col gap-4 mt-5">
						{posts &&
							posts.map((post, idx) => (
								<PostComponent
									key={post.id!}
									description={post.description!}
									name={post.title!}
									postId={post.id!}
									postedOn={post.created_at!}
									authorId={post.created_by!}
									author={name!}
									owner={user?.id === id}
									published={post.published}
								/>
							))}
					</div>
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
		.select("name, avatar_url")
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
			name: data?.at(0)?.name || null,
			posts: postData,
			avatar_url: data?.at(0)?.avatar_url,
		},
	};
};

export default Profile;
