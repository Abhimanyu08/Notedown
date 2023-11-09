import Blog from "@components/BlogPostComponents/Blog";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";
import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { createSupabaseServerClient } from "@utils/createSupabaseClients";
import { getPost } from "@utils/getData";
import { cookies } from "next/headers";
import PostPreviewControls from "./PostPreviewControls";

async function PostPreview({ postId }: { postId: string }) {
	const supabase = createSupabaseServerClient(cookies);

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
