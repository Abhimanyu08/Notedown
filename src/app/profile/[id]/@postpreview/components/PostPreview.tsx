import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import React from "react";
import { ExpandButton } from "../../components/ModalButtons";
import { Database } from "@/interfaces/supabase";

async function PostPreview({
	postId,
	privatePost,
}: {
	postId: string;
	privatePost: boolean;
}) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, content, imagesToUrls } = await getPost(postId, supabase);

	return (
		<div className="flex flex-col items-center justify-center h-full w-full">
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
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-20">
				<ExpandButton postId={postId} privatePost={privatePost} />
			</div>
		</div>
	);
}
export default PostPreview;
