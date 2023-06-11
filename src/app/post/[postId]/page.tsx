import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import Toc from "@components/BlogPostComponents/TableOfContents";
import { supabase } from "@utils/supabaseClient";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import BlogContextProvider from "../components/BlogState";
import Toolbar from "../components/Toolbar";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { SUPABASE_POST_TABLE } from "@utils/constants";

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
		const { post, content, imagesToUrls } = await getPost(
			params.postId,
			supabase
		);

		return (
			<BlogContextProvider
				blogMeta={{
					title: post.title,
					description: post.description,
					language: post.language,
					imageFolder: post.image_folder,
				}}
				uploadedImages={imagesToUrls}
			>
				<div className="grow flex flex-row min-h-0 relative pt-10">
					<div
						className={`lg:basis-1/5 w-full flex-col max-w-full overflow-y-auto justify-start flex
					`}
					>
						<Toc html={content} />
					</div>
					<div
						className={`lg:basis-3/5 relative 
							hidden lg:block
							overflow-y-hidden`}
					>
						<Blog
							content={content}
							{...post}
							extraClasses="px-20"
						/>
					</div>
					<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white pl-10 mt-20">
						<Toolbar language={post?.language} id={params.postId} />
					</div>
				</div>
			</BlogContextProvider>
		);
	} catch {
		redirect("/");
	}
}

export default Post;
