import BlogContextProvider from "@components/BlogPostComponents/BlogState";
import { getPost } from "@/app/utils/getData";
import Blog from "@components/BlogPostComponents/Blog";
import { supabase } from "@utils/supabaseClient";
import {
	BackButton,
	Edit,
	ExpandButton,
	Preview,
} from "../../components/ModalButtons";
import BlogAuthorServer from "@components/BlogPostComponents/BlogAuthorServer";

async function PostModal({ params }: { params: { postId: string } }) {
	const { post, content, imagesToUrls } = await getPost(
		params.postId,
		supabase
	);
	return (
		<div className="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 bg-black z-50">
			<BlogContextProvider
				uploadedImages={imagesToUrls}
				blogMeta={{
					language: post.language,
					imageFolder: post.image_folder,
				}}
			>
				<Blog
					{...post}
					content={content}
					extraClasses="w-full px-4"
					AuthorComponent={BlogAuthorServer}
				/>
			</BlogContextProvider>
			<div className="flex absolute gap-3 top-2 right-3">
				<BackButton id={post.created_by || ""} />
				<ExpandButton postId={params.postId} privatePost={false} />
			</div>
		</div>
	);
}

export default PostModal;
