import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import React from "react";
import { ExpandButton } from "../../../../../components/ProfileComponents/ModalButtons";
import { Database } from "@/interfaces/supabase";
import PostPreviewControls from "./PostPreviewControls";
import ClosePostPreview from "./ClosePostPreview";

async function PostPreview({ postId }: { postId: string }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls } = await getPost(postId, supabase);

	return (
		<div className="flex flex-col items-center justify-center h-full w-full relative">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					id: post.id,
					title: post.title,
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				{/* <PublishModal publishPostAction={publishPostAction} /> */}
				<Blog
					{...post}
					content={content}
					extraClasses="w-full "
					AuthorComponent={BlogAuthorServer}
				/>
				<PostPreviewControls {...{ post, content }} />
			</BlogContextProvider>
			<ClosePostPreview />
		</div>
	);
}
export default PostPreview;
