import { getPost } from "@/app/utils/getData";
import { SUPABASE_POST_TABLE } from "@utils/constants";
import { supabase } from "@utils/supabaseClient";
import { Metadata } from "next";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { redirect } from "next/navigation";
import BlogLayout from "../components/BlogLayout";
import { parseFrontMatter } from "@utils/getResources";
import Toolbar from "../components/Toolbar";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";

export const revalidate = 60 * 60 * 24 * 365 * 10;

export async function generateMetadata({
	params,
}: {
	params: PostParams;
}): Promise<Metadata | undefined> {
	const { data } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select("title, description, bloggers(name), published_on")
		.eq("id", params.postId)
		.single();
	if (!data) return;

	const { title, description } = data;
	return {
		title,
		description,
		openGraph: {
			title,
			description: description!,
			type: "article",
			publishedTime: data.published_on!,
			url: `https://rce-blog.xyz/post/${params.postId}`,
		},
		twitter: {
			card: "summary",
			title,
			description: description!,
		},
	};
}

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Post({ params }: { params: PostParams }) {
	try {
		const { post, markdown, imagesToUrls, fileNames } = await getPost(
			params.postId,
			supabase
		);

		return (
			<BlogContextProvider
				blogMeta={{
					id: post?.id,
					title: post?.title,
					description: post?.description,
					language: post?.language,
					imageFolder: post?.image_folder,
					blogger: post?.bloggers as { id: string; name: string },
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
	} catch {
		redirect("/");
	}
}

export default Post;
