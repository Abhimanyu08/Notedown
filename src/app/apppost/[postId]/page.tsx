import PostWithBlogger from "interfaces/PostWithBlogger";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import React from "react";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import TocLayout from "../TocLayout";
import BlogLayout from "@components/BlogPostComponents/BlogLayout";
import { Blog } from "@components/BlogPostComponents/Blog";
import BlogPreviewLayout from "../BlogLayout";
import BlogContextProvider from "../BlogState";
import ToolbarLayout from "../ToolbarLayout";
import Toolbar from "../Toolbar";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { supabase } from "@utils/supabaseClient";
import { getPostMarkdown } from "@/app/utils/getPostMarkdown";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Post({ params }: { params: PostParams }) {
	const { content, post } = await getPostMarkdown(params.postId);
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
