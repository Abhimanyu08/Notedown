import { PostgrestError } from "@supabase/supabase-js";
import matter from "gray-matter";
import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEventHandler, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { MdCancel } from "react-icons/md";
import {
	SUPABASE_BLOGGER_TABLE,
	SUPABASE_BUCKET_NAME,
	SUPABASE_POST_TABLE,
} from "../../../utils/constants";
import { supabase } from "../../../utils/supabaseClient";
import Layout from "../../components/Layout";
import Blogger from "../../interfaces/Blogger";
import FileMetadata from "../../interfaces/FileMetdata";
import Post from "../../interfaces/Post";

interface ProfileProps {
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

function Profile({ name, posts, avatar_url }: ProfileProps) {
	const router = useRouter();
	const { id } = router.query;
	const [file, setFile] = useState<File | null>();
	const [owner, setOwner] = useState(() => supabase.auth.user()?.id === id);
	const [uploading, setUploading] = useState(false);

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

		const { data, error } = await supabase.storage
			.from(SUPABASE_BUCKET_NAME)
			.upload(`${id}/${file.name}`, file);
		if (error) {
			alert(error.message);
			console.log(error);
			return;
		}

		const { data: postTableData, error: postTableError } = await supabase
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
		<Layout>
			<div className="grid grid-cols-6 text-white ">
				<div className="col-span-2  ">
					<div className="flex flex-col items-center">
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
				<div className="col-start-3 col-span-4 mx-5">
					<div className="flex justify-between items-center">
						<p className="text-3xl font-semibold">Posts</p>
						<div className="flex gap-1">
							{owner && !file && (
								<button className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600  p-1 rounded-md font-semibold text-black">
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
									key={idx}
									postId={post.id!}
									name={post.title!}
									description={post.description!}
								/>
							))}
					</div>
				</div>
			</div>
			{/* <form onSubmit={onUpload} className="absolute right-0">
				<input
					type="file"
					accept="md"
					onChange={(e) => setFile(e.target.files?.item(0))}
				/>
				<button type="submit">Upload post</button>
			</form>
			<div>
				<p>{name ? name : "anon"}</p>
				<ul>
					{postTitles?.map((post, idx) => (
						<li key={idx}>
							<Link href={`/posts/${post.id}`}>{post.title}</Link>
						</li>
					))}
				</ul>
			</div> */}
		</Layout>
	);
}

const PostComponent: React.FC<{
	postId: number;
	name: string;
	description: string;
}> = ({ postId, name, description }) => {
	return (
		<div className="text-white">
			<Link href={`/posts/${postId}`}>
				<p className="text-xl font-medium">{name} </p>
			</Link>
			<p>{description}</p>
		</div>
	);
};

export const getServerSideProps: GetServerSideProps<
	ProfileProps,
	{ id: string }
> = async (context) => {
	const id = context.params?.id;
	if (!id) return { props: { name: "", postTitles: [] } };

	const { data, error }: UserQueryResult = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("name, avatar_url")
		.eq("id", id);

	const { data: postData, error: postError }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("title, id, description")
		.eq("created_by", id);

	if (error || postError || !data || !postData) {
		console.log("error -> ", error);
		console.log("postError -> ", postError);
	}

	return {
		props: {
			name: data?.at(0)?.name,
			posts: postData,
			avatar_url: data?.at(0)?.avatar_url,
		},
	};
};

export default Profile;
