import { getPost } from "@utils/getData";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { Metadata } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import BlogLayout from "../components/BlogLayout";
import Toolbar from "../components/Toolbar";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";

export async function generateMetadata({
	params,
}: {
	params: PostParams;
}): Promise<Metadata | undefined> {
	let data: any;
	if (isNaN(parseInt(params.postId))) {
		const resp = await supabase
			.from(SUPABASE_POST_TABLE)
			.select("title, description, bloggers(name), published_on")
			.eq("slug", params.postId)
			.single();
		data = resp.data;
	} else {
		const resp = await supabase
			.from(SUPABASE_POST_TABLE)
			.select("title, description, bloggers(name), published_on")
			.eq("id", params.postId)
			.single();
		data = resp.data;
	}
	if (!data) return;

	const { title, description } = data;
	return {
		title,
		description,
		openGraph: {
			title,
			description: description || "",
			type: "article",
			publishedTime: data.published_on!,
			url: `https://notedown.art/note/${params.postId}`,
		},
		twitter: {
			card: "summary",
			title,
			description: description || "",
		},
	};
}

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Note({ params }: { params: PostParams }) {
	const { post, markdown, imagesToUrls, fileNames } = await getPost(
		params.postId,
		supabase
	);

	return (
		<BlogContextProvider
			blogMeta={{
				id: post?.id,
				language: post?.language,
				imageFolder: post?.image_folder,
				blogger: post?.bloggers as { id: string; name: string },
				timeStamp: post.timestamp!,
			}}
			uploadedImages={imagesToUrls}
			fileNames={fileNames}
		>
			<BlogLayout
				postMeta={{ post, markdown, imagesToUrls, fileNames }}
				ToolbarComponent={Toolbar}
				AuthorComponent={BlogAuthorServer}
			/>
		</BlogContextProvider>
	);
}

export default Note;
