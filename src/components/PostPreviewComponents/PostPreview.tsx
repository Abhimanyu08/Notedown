import { getPost } from "@utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";
import React from "react";
import { Database } from "@/interfaces/supabase";
import PostPreviewControls from "./PostPreviewControls";

async function PostPreview({ postId }: { postId: string }) {
	const supabase = createServerComponentSupabaseClient<Database>({
		headers,
		cookies,
	});

	const { post, markdown, imagesToUrls, fileNames } = await getPost(
		postId,
		supabase
	);

	return (
		<div
			className="flex flex-col items-center justify-center w-full relative
			 
		"
		>
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				fileNames={fileNames}
				blogMeta={{
					id: post.id,
					title: post.title,
					language: post.language as any,
					imageFolder: post.image_folder,
					blogger: post.bloggers as { id: string; name: string },
					timeStamp: post.timestamp!,
				}}
			>
				{/* <PublishModal publishPostAction={publishPostAction} /> */}
				<Blog
					{...post}
					markdown={markdown}
					AuthorComponent={BlogAuthorServer}
				/>
				<PostPreviewControls markdown={markdown} postMeta={post} />
			</BlogContextProvider>
		</div>
	);
}
export default PostPreview;
