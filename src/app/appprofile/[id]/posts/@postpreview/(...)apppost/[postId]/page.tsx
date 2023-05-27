import { getPostMarkdown } from "@/app/utils/getPostMarkdown";
import { Blog } from "@components/BlogPostComponents/Blog";
import React from "react";
import { BackButton, ExpandButton } from "../../../components/ModalButtons";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import { SUPABASE_POST_TABLE, SUPABASE_FILES_BUCKET } from "@utils/constants";
import { getHtmlFromMarkdown } from "@utils/getResources";
import { Database } from "@/interfaces/supabase";
import { getPost } from "@/app/utils/getData";
import BlogContextProvider from "@/app/apppost/components/BlogState";

async function PostModal({ params }: { params: { postId: string } }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls } = await getPost(
		params.postId,
		supabase
	);
	return (
		<div className="flex flex-col items-center justify-center h-full w-full relative">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				<Blog {...{ ...post, content }} extraClasses="w-full px-4" />
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-3">
				<ExpandButton postId={params.postId} />
				<BackButton id={post.created_by || ""} />
			</div>
		</div>
	);
}

export default PostModal;
