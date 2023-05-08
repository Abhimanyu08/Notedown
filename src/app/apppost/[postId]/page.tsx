import PostWithBlogger from "interfaces/PostWithBlogger";
import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import React from "react";
import {
	SUPABASE_POST_TABLE,
	SUPABASE_FILES_BUCKET,
} from "../../../../utils/constants";
import { getHtmlFromMarkdown } from "../../../../utils/getResources";
import { supabase } from "../../../../utils/supabaseClient";
import { Toc } from "@components/BlogPostComponents/TableOfContents";
import TocLayout from "../TocLayout";
import BlogLayout from "@components/BlogPostComponents/BlogLayout";
import { Blog } from "@components/BlogPostComponents/Blog";
import BlogPreviewLayout from "../BlogLayout";

interface PostParams extends NextParsedUrlQuery {
	postId: string;
}

async function Post({ params }: { params: PostParams }) {
	const { data: post, error } = await supabase
		.from<PostWithBlogger>(SUPABASE_POST_TABLE)
		.select(
			"id,created_by,title,description,language,published_on,filename,image_folder, bloggers(name)"
		)
		.match({ id: params?.postId })
		.single();

	if (error || !post) return { props: {}, redirect: "/" };

	const filename = post.filename;
	const { data: fileData, error: fileError } = await supabase.storage
		.from(SUPABASE_FILES_BUCKET)
		.download(filename);

	if (fileError || !fileData) return { props: {}, redirect: "/" };
	const content = (await getHtmlFromMarkdown(fileData)).content;
	return (
		<div className="grow flex flex-row min-h-0 relative pt-10">
			<TocLayout>
				<Toc html={content} />
			</TocLayout>
			<BlogPreviewLayout>
				<Blog {...{ ...post, content }} />
			</BlogPreviewLayout>
		</div>
	);
}

export default Post;
