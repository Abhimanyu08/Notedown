import { getPostMarkdown } from "@/app/utils/getPostMarkdown";
import { Blog } from "@components/BlogPostComponents/Blog";
import React from "react";
import { BackButton, ExpandButton } from "../../../components/ModalButtons";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { Database } from "@/interfaces/supabase";

async function PostModal({ params }: { params: { postId: string } }) {
	if (!params.postId) return <></>;
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
	// const { content, post } = await getPostMarkdown(params.postId);
	if (!post || !content) return <></>;
	return (
		<div className="h-full w-full absolute bg-black">
			<div className="flex flex-col items-center justify-center h-full w-full relative">
				<Blog {...{ ...post, content }} extraClasses="w-full" />
				<div className="flex absolute gap-3 top-2 right-3">
					<ExpandButton postId={params.postId} />
					<BackButton id={post.created_by || ""} />
				</div>
			</div>
		</div>
	);
}

export default PostModal;
