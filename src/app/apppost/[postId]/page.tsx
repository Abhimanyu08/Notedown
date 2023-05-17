import { Database } from "@/interfaces/supabase";
import { Blog } from "@components/BlogPostComponents/Blog";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SUPABASE_FILES_BUCKET, SUPABASE_POST_TABLE } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import { cookies, headers } from "next/headers";
import BlogPreviewLayout from "../BlogLayout";
import BlogContextProvider from "../BlogState";
import TocLayout from "../TocLayout";
import Toolbar from "../Toolbar";
import ToolbarLayout from "../ToolbarLayout";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Post({ params }: { params: PostParams }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { data: post, error } = await supabase
		.from(SUPABASE_POST_TABLE)
		.select(
			"id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)"
		)
		.match({ id: params.postId })
		.single();

	if (error || !post) return { post: null, content: null };

	const filename = post.filename;

	if (!filename) return { post, content: null };
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download(filename);

	if (!fileData) return { post, content: null };

	const content = (await getHtmlFromMarkdown(fileData)).content;

	return (
		<div className="grow flex flex-row min-h-0 relative pt-10">
			<TocLayout>
				<Toc html={content} />
			</TocLayout>
			<BlogContextProvider language={post?.language}>
				<BlogPreviewLayout>
					<Blog {...{ ...post, content }} extraClasses="px-20" />
				</BlogPreviewLayout>
				<ToolbarLayout>
					<Toolbar language={post?.language} id={params.postId} />
				</ToolbarLayout>
			</BlogContextProvider>
		</div>
	);
}

export default Post;
