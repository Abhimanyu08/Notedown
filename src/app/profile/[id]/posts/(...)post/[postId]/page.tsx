import BlogContextProvider from "@/app/post/components/BlogState";
import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import { supabase } from "@utils/supabaseClient";
import { BackButton, ExpandButton } from "../../components/ModalButtons";

async function PostModal({ params }: { params: { postId: string } }) {
	const { post, content, imagesToUrls } = await getPost(
		params.postId,
		supabase
	);
	return (
		<div className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 bg-black">
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
				<BackButton id={post.created_by || ""} />
				<ExpandButton postId={params.postId} privatePost={false} />
			</div>
		</div>
	);
}

export default PostModal;
