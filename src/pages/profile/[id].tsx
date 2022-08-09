import { PostgrestError } from "@supabase/supabase-js";
import matter from "gray-matter";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
	FormEventHandler,
	MouseEventHandler,
	useEffect,
	useState,
} from "react";
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
	postTitles?: Post[] | null;
}

interface UserQueryResult {
	data: Blogger[] | null;
	error: PostgrestError | null;
}

interface PostQueryResult {
	data: Post[] | null;
	error: PostgrestError | null;
}

function Profile({ name, postTitles }: ProfileProps) {
	const router = useRouter();
	const { id } = router.query;
	const [file, setFile] = useState<File | null>();

	const onUpload: FormEventHandler = async (e) => {
		e.preventDefault();

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

		console.log("storage data-> ", data);
		console.log("post table data->", postTableData);
		alert("file uploaded successfully");
	};
	return (
		<Layout>
			<form onSubmit={onUpload} className="absolute right-0">
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
			</div>
		</Layout>
	);
}

export const getServerSideProps: GetServerSideProps<
	ProfileProps,
	{ id: string }
> = async (context) => {
	const id = context.params?.id;
	if (!id) return { props: { name: "", postTitles: [] } };

	const { data, error }: UserQueryResult = await supabase
		.from(SUPABASE_BLOGGER_TABLE)
		.select("name")
		.eq("id", id);

	const { data: postData, error: postError }: PostQueryResult = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("title, id")
		.eq("created_by", id);

	if (error || postError || !data || !postData) {
		console.log("error -> ", error);
		console.log("postError -> ", postError);
	}

	return {
		props: {
			name: data?.at(0)?.name,
			postTitles: postData,
		},
	};
};

export default Profile;
