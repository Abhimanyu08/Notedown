import { Database } from "@/interfaces/supabase";
import { Blog } from "@components/BlogPostComponents/Blog";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_FILES_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { cookies, headers } from "next/headers";
import BlogContextProvider from "../components/BlogState";
import PrivateToolbar from "../components/PrivateToolbar";
import Toolbar from "../components/Toolbar";
import { getPost } from "@/app/utils/getData";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Post({ params }: { params: PostParams }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

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
					<Blog content={content} {...post} extraClasses="px-20" />
				</div>
				<div className="hidden lg:flex lg:flex-col basis-1/5  gap-10 text-black dark:text-white ml-10 mt-20">
					{post.published ? (
						<Toolbar language={post?.language} id={params.postId} />
					) : (
						<PrivateToolbar language={post.language} />
					)}
				</div>
			</div>
		</BlogContextProvider>
	);
}

export default Post;
